// libs
import React from "react";

// components
import { ToggleButton } from "./ToggleButton";
import { Oscilloscope } from "../Oscilloscope";

// contexts
import { ThemeContext } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";
import { MusicPlayerContext } from "../../contexts/contexts";

// reducers
import { ToggleButtonGroupReducer } from "../../reducers/ToggleButtonGroupReducer";

// styles
import "../../styles/components/ToggleButtonGroup.scss";
import "../../styles/components/Oscilloscope.scss";

export const ToggleButtonGroup = (props) => {
  const { name } = props;
  const { WAW } = React.useContext(WebAudioContext);
  const { id } = React.useContext(SongContext);
  const { groupMuteButton, groupSoloButton } = React.useContext(ThemeContext);
  const { groupSolos } = React.useContext(MusicPlayerContext);
  const musicPlayerDispatch = React.useContext(MusicPlayerContext).dispatch;
  const [state, dispatch] = React.useReducer(ToggleButtonGroupReducer, {
    maxPolyphony: props.polyphony,
    polyphony: 0,
    players: [],
    playerOrder: [],
    playerOverrides: [],
  });

  const [solo, setSolo] = React.useState(false);
  const [mute, setMute] = React.useState(false);

  const groupNode = WAW.getEffects(id).groupNodes[name];

  /* Solo and Mute Effects */
  React.useEffect(() => {
    if (solo && !mute) {
      groupNode.gain.value = 1;
    } else if (solo && mute) {
      groupNode.gain.value = 1;
    } else if (!solo && mute) {
      groupNode.gain.value = 0;
    } else if (!solo && !mute && groupSolos.length === 0) {
      groupNode.gain.value = 1;
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [solo, mute, groupSolos]);

  /* Solo Effects */
  React.useEffect(() => {
    if (groupSolos.length > 0) {
      if (groupSolos.indexOf(name) === -1) {
        setSolo(false);
        groupNode.gain.value = 0;
      } else {
        setSolo(true);
        groupNode.gain.value = 1;
      }
    } else {
      setSolo(false);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [groupSolos]);

  /* Reset & Randomize Callbacks and Effects */
  React.useEffect(() => {
    const handleReset = () => {
      // take the simple route - click the players!
      const activePlayers = state.players.filter(
        (p) => p.playerState === "active" || p.playerState === "pending-start"
      );
      activePlayers.forEach((p) => p.ref.click());
    };

    const handleRandomize = () => {
      // get the effective poly; the max number of voices to enable
      const ePoly =
        state.maxPolyphony === -1 ? state.players.length : state.maxPolyphony;
      // ensures at least 1 voice from each group is enabled
      const count = Math.ceil(Math.random() * ePoly);
      // keep track of how many are enabled in each group
      const playersToEnable = [];
      // choose a random player from the set
      while (playersToEnable.length < count) {
        const rand = Math.floor(Math.random() * state.players.length);
        const id = state.players[rand].id;
        if (playersToEnable.indexOf(id) === -1) {
          playersToEnable.push(id);
        }
      }
      state.players.forEach((p) => {
        // start stopped players in the enable list
        if (playersToEnable.indexOf(p.id) !== -1) {
          if (p.playerState === "stopped") {
            p.ref.click();
          }
        } else {
          // stop active players not in the enable list
          if (p.playerState !== "stopped") {
            p.ref.click();
          }
        }
      });
    };

    musicPlayerDispatch({
      type: "addResetCallback",
      payload: {
        name: name,
        resetCallback: handleReset,
      },
    });

    musicPlayerDispatch({
      type: "addRandomizeCallback",
      payload: {
        name: name,
        randomizeCallback: handleRandomize,
      },
    });
  }, [
    musicPlayerDispatch,
    name,
    state.maxPolyphony,
    state.players,
    state.polyphony,
  ]);

  const handleToggleSolo = React.useCallback(() => {
    if (solo) {
      musicPlayerDispatch({
        type: "removeGroupSolo",
      });
    } else {
      musicPlayerDispatch({
        type: "addGroupSolo",
        payload: name,
      });
    }
  }, [solo, musicPlayerDispatch, name]);

  return (
    <div className="toggle-button-group flex-col">
      <div className="flex-row">
        <h3>
          {name} ({state.polyphony} /{" "}
          {state.maxPolyphony === -1 ? props.voices.length : state.maxPolyphony}
          )
        </h3>

        <Oscilloscope
          index={props.index}
          groupCount={props.groupCount}
          gradient={true}
          name={name}
          animate={false}
        />

        <button
          className="solo-button"
          style={
            solo
              ? {
                  background: groupSoloButton,
                }
              : undefined
          }
          onClick={handleToggleSolo}
        >
          S
        </button>

        <button
          className="mute-button"
          style={
            mute
              ? {
                  background: groupMuteButton,
                }
              : undefined
          }
          onClick={() => setMute(!mute)}
        >
          M
        </button>
      </div>

      <div className="toggle-buttons flex-row">
        {React.useCallback(
          props.voices.map((voice) => (
            <ToggleButton
              dispatch={dispatch}
              key={voice.name}
              name={voice.name}
              groupName={name}
              length={voice.length}
              quantizeLength={voice.quantizeLength}
              override={state.playerOverrides.indexOf(voice.name) !== -1}
            />
          )),
          [props.voices, name, state.playerOverrides, dispatch]
        )}
      </div>
    </div>
  );
};
