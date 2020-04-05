// libs
import React from "react";

// components
import { ToggleButton } from "./ToggleButton";
import { Oscilloscope } from "../Oscilloscope";

// contexts
import { ThemeContext } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";

// reducers
import { ToggleButtonGroupReducer } from "../../reducers/ToggleButtonGroupReducer";

// styles
import "../../styles/components/ToggleButtonGroup.scss";
import "../../styles/components/Oscilloscope.scss";

export const ToggleButtonGroup = (props) => {
  const { WAW } = React.useContext(WebAudioContext);
  const { id } = React.useContext(SongContext);
  const { groupMuteButton, groupSoloButton } = React.useContext(ThemeContext);

  const [state, dispatch] = React.useReducer(ToggleButtonGroupReducer, {
    maxPolyphony: props.polyphony,
    polyphony: 0,
    players: [],
    playerOrder: [],
    playerOverrides: [],
  });

  const [solo, setSolo] = React.useState(false);
  const [mute, setMute] = React.useState(false);

  const groupNode = WAW.getEffects(id).groupNodes[props.name];

  React.useEffect(() => {
    // solo overrides mute, so only mute when it's exclusive state
    if (mute && !solo) {
      groupNode.gain.value = 0;

      // when mute is turned off, add volume if group is not also overridden by another group's solo
    } else if (!mute && !props.soloOverride) {
      groupNode.gain.value = 1;
    }

    // if solo is turned on ...
    if (solo) {
      // add override and turn volume on
      props.handleAddSolo(props.name);
      groupNode.gain.value = 1;
    }

    if (props.soloOverride === props.name && !solo) {
      // turn off override
      props.handleAddSolo(false);
      // if this group was also on mute, return the volume to that state
      if (mute) {
        groupNode.gain.value = 0;
      }
    }
  }, [mute, solo, props, groupNode]);

  React.useEffect(() => {
    // if this group has been overriden by another solo ...
    if (props.soloOverride && props.soloOverride !== props.name) {
      setSolo(false);
      groupNode.gain.value = 0;
    }

    // if override has been undone
    if (!props.soloOverride && !mute) {
      groupNode.gain.value = 1;
    }
  }, [props.soloOverride, mute, props.name, groupNode]);

  return (
    <div className="toggle-button-group flex-col">
      <div className="flex-row">
        <h3>
          {props.name} ({state.polyphony} /{" "}
          {state.maxPolyphony === -1 ? props.voices.length : state.maxPolyphony}
          )
        </h3>

        <Oscilloscope
          index={props.index}
          groupCount={props.groupCount}
          gradient={true}
          name={props.name}
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
          onClick={() => setSolo(!solo)}
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
        {props.voices.map((voice) => (
          <ToggleButton
            dispatch={dispatch}
            key={voice.name}
            name={voice.name}
            groupName={props.name}
            length={voice.length}
            quantizeLength={voice.quantizeLength}
            override={state.playerOverrides.indexOf(voice.name) !== -1}
          />
        ))}
      </div>
    </div>
  );
};
