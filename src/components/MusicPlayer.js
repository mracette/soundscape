// libs
import React from "react";

// components
import { CanvasViz } from "./CanvasViz";
import { EffectsPanel } from "./EffectsPanel";
import { FreqBands } from "./FreqBands";
import { MenuButtonParent } from "./menu-button/MenuButtonParent";
import { SongInfoPanel } from "./SongInfoPanel";
import { ToggleButtonPanel } from "./toggle-button/ToggleButtonPanel";
import { HomePanel } from "./HomePanel";

// context
import { MusicPlayerContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";
import { TestingContext } from "../contexts/contexts";
import { WAW } from "./AppWrap";

// reducers
import { MusicPlayerReducer } from "../reducers/MusicPlayerReducer";

// styles
import "../styles/components/MusicPlayer.scss";

export const MusicPlayer = () => {
  const { flags } = React.useContext(TestingContext);
  const { id, bpm, groups, ambientTrack } = React.useContext(SongContext);

  const backgroundModeEventRef = React.useRef(null);
  const [wawIsLoading, setWawIsLoading] = React.useState(true);
  const [state, dispatch] = React.useReducer(MusicPlayerReducer, {
    isLoading: true,
    backgroundMode: false,
    randomizeEffects: false,
    pauseVisuals: false,
    mute: false,
    players: [],
  });

  // initialize web audio state
  wawIsLoading &&
    WAW.initSongState(id).then(() => {
      setWawIsLoading(false);
    });

  /* Randomize Callback */
  const handleRandomize = React.useCallback(() => {
    const voicesToEnable = [];

    groups.forEach((g) => {
      // get the effective poly; the max number of voices to enable
      const ePoly = g.polyphony === -1 ? g.voices.length : g.polyphony;

      // ensures 1 voice from each group is enabled
      const count = Math.ceil(Math.random() * ePoly);

      // keep track of how many are enabled in each group
      const groupCount = [];

      while (groupCount.length < count) {
        const rand = Math.floor(Math.random() * g.voices.length);
        const id = g.voices[rand].name;
        if (groupCount.indexOf(id) === -1) {
          groupCount.push(id);
          voicesToEnable.push(id);
        }
      }
    });

    state.players.forEach((p) => {
      if (voicesToEnable.indexOf(p.id) !== -1) {
        if (p.playerState === "stopped") {
          p.buttonRef.click();
        }
      } else {
        if (p.playerState !== "stopped") {
          p.buttonRef.click();
        }
      }
    });
  }, [state.players, groups]);

  /* Reset Callback */
  const handleReset = React.useCallback(() => {
    // take the simple route - click the players!
    const activePlayers = state.players.filter(
      (p) => p.playerState === "active" || p.playerState === "pending-start"
    );
    activePlayers.forEach((p) => p.buttonRef.click());
  }, [state.players]);

  /* Background Mode Callback */
  const triggerRandomVoice = React.useCallback(() => {
    const viableOne = state.players.filter(
      (p) => !p.playerState.includes("pending")
    );
    const randomOne = Math.floor(Math.random() * viableOne.length);
    state.players[randomOne].buttonRef.click();

    // trigger an additional voice when less than 1/2 are active
    if (viableOne.length >= state.players.length) {
      const viableTwo = viableOne.filter(
        (p, i) => i !== randomOne && p.groupName !== randomOne.groupName
      );
      const randomTwo = Math.floor(Math.random() * viableTwo.length);
      state.players[randomTwo].buttonRef.click();
    }
  }, [state.players]);

  React.useEffect(() => {
    console.log(wawIsLoading);
    if (!wawIsLoading) {
      console.log(Object.keys(WAW.getVoices(id)));
      // should be safe to resume and take the init time here (after user gesture)
      if (flags.playAmbientTrack && ambientTrack) {
        WAW.audioCtx.resume();
        WAW.getVoices(id).ambient.start();
      }

      // music player cleanup
      return () => {
        WAW.scheduler.clear();
        WAW.audioCtx.suspend();
        flags.playAmbientTrack && WAW.getVoices(id).ambient.stop();
      };
    }
  }, [ambientTrack, flags.playAmbientTrack, id, wawIsLoading]);

  /* Background Mode Hook */
  React.useEffect(() => {
    if (!wawIsLoading) {
      // init event
      if (
        state.backgroundMode &&
        !WAW.scheduler.repeatingQueue.find(
          (e) => e.id === backgroundModeEventRef.current
        )
      ) {
        backgroundModeEventRef.current = WAW.scheduler.scheduleRepeating(
          WAW.audioCtx.currentTime + 60 / bpm,
          (32 * 60) / bpm,
          triggerRandomVoice
        );
        // update event
      } else if (state.backgroundMode) {
        WAW.scheduler.updateCallback(
          backgroundModeEventRef.current,
          triggerRandomVoice
        );
        // stop event
      } else if (!state.backgroundMode) {
        WAW.scheduler.cancel(backgroundModeEventRef.current);
      }
    }
  }, [bpm, state.backgroundMode, triggerRandomVoice, wawIsLoading]);

  /* Mute Hook */
  React.useEffect(() => {
    if (!wawIsLoading) {
      const startMute = () => {
        WAW.getEffects().premaster.gain.value = 0;
      };

      const stopMute = () => {
        WAW.getEffects().premaster.gain.value = 1;
      };

      if (state.mute) {
        startMute();
      } else {
        stopMute();
      }
    }
  }, [state.mute, state.premaster, wawIsLoading]);

  const HomePanelMemo = React.useMemo(() => <HomePanel />, []);
  const SongInfoPanelMemo = React.useMemo(() => <SongInfoPanel />, []);
  const EffectsPanelMemo = React.useMemo(
    () => <EffectsPanel dispatch={dispatch} />,
    [dispatch]
  );
  const ToggleButtonPanelMemo = React.useMemo(
    () => (
      <ToggleButtonPanel
        handleRandomize={handleRandomize}
        handleReset={handleReset}
        players={state.players}
      />
    ),
    [handleRandomize, handleReset, state.players]
  );

  return (
    <MusicPlayerContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {wawIsLoading ? undefined : (
        <>
          <FreqBands />

          {/* <MenuButtonParent
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
          /> */}

          {/* <CanvasViz /> */}
        </>
      )}
    </MusicPlayerContext.Provider>
  );
};
