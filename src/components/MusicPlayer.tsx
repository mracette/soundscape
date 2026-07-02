import { useContext, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { CanvasViz } from "./canvas/CanvasViz";
import { EffectsPanel } from "./EffectsPanel";
import { FreqBands } from "./FreqBands";
import { MenuButtonParent } from "./menu-button/MenuButtonParent";
import { SongInfoPanel } from "./SongInfoPanel";
import { ToggleButtonPanel } from "./toggle-button/ToggleButtonPanel";
import { HomePanel } from "./HomePanel";
import { LoadingScreen } from "../components/LoadingScreen";
import { SongContext } from "../contexts/contexts";
import { TestingContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";
import { useMusicPlayerStore } from "../stores/musicPlayerStore";
import { nextSubdivision } from "../utils/audioUtils";
import { lerp } from "../utils/mathUtils";

/*
 * Energy drives the background-mode voice loop, modulating two things: the target
 * number of active voices and the variability rate. The loop ticks every
 * VOICE_TICK_BEATS; when off target it steps one voice toward it, and once at
 * target it occasionally swaps a voice (random out, random in) at a mean spacing
 * that Energy scales from very slow (calm) to brisk (lively). Voice selection is
 * random — no per-group weighting.
 */
const VOICE_TICK_BEATS = 8;
const MIN_VOICES = 2; // target at the calm end
const MAX_VOICE_FRACTION = 0.75; // target at the lively end, as a fraction of the scene
const CALM_SWAP_BEATS = 320; // mean beats between swaps at lowest Energy
const LIVELY_SWAP_BEATS = 48; // ...and at highest Energy

export const MusicPlayer = () => {
  const { flags } = useContext(TestingContext)!;
  const { id, bpm, ambientTrack, ambientTrackQuantize } =
    useContext(SongContext)!;
  const { WAW, wawLoadStatus } = useContext(WebAudioContext)!;

  const backgroundModeEventRef = useRef<number | null>(null);

  const [songLoadStatus, setSongLoadStatus] = useState(false);
  const [canvasLoadStatus, setCanvasLoadStatus] = useState(false);

  // Must be referentially stable: it is a dependency of CanvasViz's scene-init
  // effect, and this component is not compiler-memoized (its render calls
  // store.reset()). Without useCallback the scene re-initializes on every render.
  const handleSetCanvasLoadStatus = useCallback((status: boolean) => {
    setCanvasLoadStatus(status);
  }, []);

  // Reset the store before child ToggleButtons mount and register their voices.
  // A lazy useState initializer runs once, synchronously, before children render;
  // a useEffect would run after children register and wipe them.
  useState(() => useMusicPlayerStore.getState().reset());
  
  const resetCallbacks = useMusicPlayerStore((s) => s.resetCallbacks);
  const randomizeCallbacks = useMusicPlayerStore((s) => s.randomizeCallbacks);
  const voices = useMusicPlayerStore((s) => s.voices);
  const backgroundMode = useMusicPlayerStore((s) => s.backgroundMode);
  const energy = useMusicPlayerStore((s) => s.energy);
  const mute = useMusicPlayerStore((s) => s.mute);

  useEffect(() => {
    if (wawLoadStatus && !songLoadStatus) {
      WAW.initSongState(id)
        .then(() => {
          setSongLoadStatus(true);
        })
        .catch((err) => {
          // no error UI — the loading screen stays up, but the cause is visible
          console.error("Failed to initialize song audio:", err);
        });
    }

    // safe to resume and take the init time here (after user gesture)
    if (songLoadStatus && flags.playAmbientTrack && ambientTrack) {
      let startTime = null;
      if (ambientTrackQuantize) {
        startTime = nextSubdivision(WAW.audioCtx, bpm, 4);
      }
      WAW.audioCtx.resume();
      WAW.getVoices(id)["ambient"].start(startTime as number);
    }

    // music player cleanup
    if (songLoadStatus) {
      return () => {
        // tear down the boundary transport before the raw scheduler clear —
        // clear() alone kills the armed transport tick without firing it,
        // stranding the transport's re-arm latch for the rest of the session
        WAW.clearTransport();
        WAW.scheduler.clear();
        WAW.audioCtx.suspend();
        flags.playAmbientTrack &&
          ambientTrack &&
          WAW.getVoices(id).ambient.stop(0);
      };
    }
  }, [
    WAW,
    wawLoadStatus,
    ambientTrack,
    flags.playAmbientTrack,
    id,
    songLoadStatus,
    ambientTrackQuantize,
    bpm,
  ]);

  const handleReset = useCallback(() => {
    resetCallbacks.forEach((obj) => {
      obj.callback();
    });
  }, [resetCallbacks]);

  const handleRandomize = useCallback(() => {
    randomizeCallbacks.forEach((obj) => {
      obj.callback();
    });
  }, [randomizeCallbacks]);

  /* Background Mode Callback */
  const triggerRandomVoice = useCallback(() => {
    const viable = voices.filter((v) => !v.voiceState.includes("pending"));
    if (viable.length === 0) return;

    const active = viable.filter((v) => v.voiceState === "active");
    const stopped = viable.filter((v) => v.voiceState === "stopped");
    const target = Math.max(
      1,
      Math.round(lerp(MIN_VOICES, MAX_VOICE_FRACTION * voices.length, energy))
    );

    const pick = (list: typeof viable) =>
      list[Math.floor(Math.random() * list.length)];

    if (active.length < target && stopped.length) {
      pick(stopped).ref.click();
    } else if (active.length > target) {
      pick(active).ref.click();
    } else if (stopped.length && active.length) {
      // at target: occasionally swap one voice for slow variability
      const swapBeats = lerp(CALM_SWAP_BEATS, LIVELY_SWAP_BEATS, energy);
      if (Math.random() < VOICE_TICK_BEATS / swapBeats) {
        pick(active).ref.click();
        pick(stopped).ref.click();
      }
    }
  }, [voices, energy]);

  /* Background Mode Hook */
  useEffect(() => {
    // init event
    if (
      backgroundMode &&
      !WAW.scheduler.getEvent(backgroundModeEventRef.current!)
    ) {
      backgroundModeEventRef.current = WAW.scheduler.scheduleRepeating(
        WAW.audioCtx.currentTime + 60 / bpm,
        (VOICE_TICK_BEATS * 60) / bpm,
        triggerRandomVoice
      );
      // triggerRandomVoice updates when different voices are on
    } else if (backgroundMode) {
      WAW.scheduler.updateCallback(
        backgroundModeEventRef.current!,
        triggerRandomVoice
      );
      // stop event
    } else {
      WAW.scheduler.cancel(backgroundModeEventRef.current ?? undefined);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [bpm, backgroundMode, triggerRandomVoice]);

  /* Mute Hook */
  useEffect(() => {
    // The app effects chain (premaster) only exists once initAppState resolves.
    if (!wawLoadStatus) return;

    const startMute = () => {
      WAW.getEffects().premaster.gain.value = 0;
    };

    const stopMute = () => {
      WAW.getEffects().premaster.gain.value = 1;
    };

    if (mute) {
      startMute();
    } else {
      stopMute();
    }
  }, [WAW, mute, wawLoadStatus]);

  // Memoized because this component is not compiler-memoized (impure render);
  // without these the panels remount on every store change (e.g. each toggle).
  const homePanel = useMemo(() => <HomePanel />, []);
  const songInfoPanel = useMemo(() => <SongInfoPanel />, []);
  const effectsPanel = useMemo(() => <EffectsPanel />, []);
  const toggleButtonPanel = useMemo(
    () => (
      <ToggleButtonPanel
        handleRandomize={handleRandomize}
        handleReset={handleReset}
      />
    ),
    [handleRandomize, handleReset]
  );

  return (
    <>
      {songLoadStatus && (
        <>
          <FreqBands animate={false} />
          <MenuButtonParent
            childButtonProps={[
              {
                id: "home",
                iconName: "icon-home",
                content: homePanel,
              },
              {
                autoOpen: true,
                id: "toggles",
                iconName: "icon-music",
                content: toggleButtonPanel,
              },
              {
                id: "effects",
                iconName: "icon-equalizer",
                content: effectsPanel,
              },
              {
                id: "song-info",
                iconName: "icon-info",
                content: songInfoPanel,
              },
            ]}
          />
          <CanvasViz songLoadStatus={songLoadStatus} handleSetCanvasLoadStatus={handleSetCanvasLoadStatus} />
        </>
      )}
      {(!canvasLoadStatus || !wawLoadStatus || !songLoadStatus) && (
        <LoadingScreen />
      )}
    </>
  );
};
