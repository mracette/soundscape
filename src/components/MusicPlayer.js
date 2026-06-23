// libs
import React from "react";

// components
import { CanvasViz } from "./canvas/CanvasViz";
import { EffectsPanel } from "./EffectsPanel";
import { FreqBands } from "./FreqBands";
import { MenuButtonParent } from "./menu-button/MenuButtonParent";
import { SongInfoPanel } from "./SongInfoPanel";
import { ToggleButtonPanel } from "./toggle-button/ToggleButtonPanel";
import { HomePanel } from "./HomePanel";
import { LoadingScreen } from "../components/LoadingScreen";

// context
import { SongContext } from "../contexts/contexts";
import { TestingContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";

// store
import { useMusicPlayerStore } from "../stores/musicPlayerStore";

// other
import { nextSubdivision } from "../utils/audioUtils";

// styles
import "../styles/components/MusicPlayer.scss";

export const MusicPlayer = () => {
  const { flags } = React.useContext(TestingContext);
  const { id, bpm, ambientTrack, ambientTrackQuantize } =
    React.useContext(SongContext);
  const { WAW, wawLoadStatus } = React.useContext(WebAudioContext);

  const backgroundModeEventRef = React.useRef(null);

  const [songLoadStatus, setSongLoadStatus] = React.useState(false);
  const [canvasLoadStatus, setCanvasLoadStatus] = React.useState(false);
  const handleSetCanvasLoadStatus = React.useCallback(
    (status) => {
      setCanvasLoadStatus(status);
    },
    [setCanvasLoadStatus]
  );

  React.useState(() => useMusicPlayerStore.getState().reset());
  const resetCallbacks = useMusicPlayerStore((s) => s.resetCallbacks);
  const randomizeCallbacks = useMusicPlayerStore((s) => s.randomizeCallbacks);
  const voices = useMusicPlayerStore((s) => s.voices);
  const backgroundMode = useMusicPlayerStore((s) => s.backgroundMode);
  const mute = useMusicPlayerStore((s) => s.mute);

  React.useEffect(() => {
    if (wawLoadStatus && !songLoadStatus) {
      WAW.initSongState(id).then(() => {
        setSongLoadStatus(true);
      });
    }

    // safe to resume and take the init time here (after user gesture)
    if (songLoadStatus && flags.playAmbientTrack && ambientTrack) {
      let startTime = null;
      if (ambientTrackQuantize) {
        startTime = nextSubdivision(WAW.audioCtx, bpm, 4);
      }
      WAW.audioCtx.resume();
      WAW.getVoices(id)["ambient"].start(startTime);
    }

    // music player cleanup
    if (songLoadStatus) {
      return () => {
        WAW.scheduler.clear();
        WAW.audioCtx.suspend();
        flags.playAmbientTrack &&
          ambientTrack &&
          WAW.getVoices(id).ambient.stop();
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

  const handleReset = React.useCallback(() => {
    resetCallbacks.forEach((obj) => {
      obj.resetCallback();
    });
  }, [resetCallbacks]);

  const handleRandomize = React.useCallback(() => {
    randomizeCallbacks.forEach((obj) => {
      obj.randomizeCallback();
    });
  }, [randomizeCallbacks]);

  /* Background Mode Callback */
  const triggerRandomVoice = React.useCallback(() => {
    const viableOne = voices.filter(
      (v) => !v.voiceState.includes("pending")
    );
    const randomOne = Math.floor(Math.random() * viableOne.length);
    voices[randomOne].ref.click();

    // trigger an additional voice when less than 1/2 are active
    if (viableOne.length >= voices.length) {
      const viableTwo = viableOne.filter(
        (p, i) => i !== randomOne && p.groupName !== randomOne.groupName
      );
      const randomTwo = Math.floor(Math.random() * viableTwo.length);
      voices[randomTwo].ref.click();
    }
  }, [voices]);

  /* Background Mode Hook */
  React.useEffect(() => {
    // init event
    if (
      backgroundMode &&
      !WAW.scheduler.getEvent(backgroundModeEventRef.current)
    ) {
      backgroundModeEventRef.current = WAW.scheduler.scheduleRepeating(
        WAW.audioCtx.currentTime + 60 / bpm,
        (32 * 60) / bpm,
        triggerRandomVoice
      );
      // triggerRandomVoice updates when different voices are on
    } else if (backgroundMode) {
      WAW.scheduler.updateCallback(
        backgroundModeEventRef.current,
        triggerRandomVoice
      );
      // stop event
    } else if (!backgroundMode) {
      WAW.scheduler.cancel(backgroundModeEventRef.current);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [bpm, backgroundMode, triggerRandomVoice]);

  /* Mute Hook */
  React.useEffect(() => {
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
  }, [WAW, mute]);

  const HomePanelMemo = React.useMemo(() => <HomePanel />, []);
  const SongInfoPanelMemo = React.useMemo(() => <SongInfoPanel />, []);
  const EffectsPanelMemo = React.useMemo(() => <EffectsPanel />, []);
  const ToggleButtonPanelMemo = React.useMemo(
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
            name="Menu"
            direction="right"
            separation="6rem"
            parentSize="5rem"
            childButtonProps={[
              {
                id: "home",
                iconName: "icon-home",
                content: HomePanelMemo,
              },
              {
                autoOpen: true,
                id: "toggles",
                iconName: "icon-music",
                content: ToggleButtonPanelMemo,
              },
              {
                id: "effects",
                iconName: "icon-equalizer",
                content: EffectsPanelMemo,
              },
              {
                id: "song-info",
                iconName: "icon-info",
                content: SongInfoPanelMemo,
              },
            ]}
          />
          <CanvasViz handleSetCanvasLoadStatus={handleSetCanvasLoadStatus} />
        </>
      )}
      {(!canvasLoadStatus || !wawLoadStatus || !songLoadStatus) && (
        <LoadingScreen />
      )}
    </>
  );
};
