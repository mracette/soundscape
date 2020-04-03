// libs
import React from "react";

// components
import { ToggleButton } from "./ToggleButton";
import { Oscilloscope } from "../Oscilloscope";

// contexts
import { ThemeContext } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";
import { WAW } from "../AppWrap";

// styles
import "../../styles/components/ToggleButtonGroup.scss";
import "../../styles/components/Oscilloscope.scss";

export const ToggleButtonGroup = (props) => {
  const { id } = React.useContext(SongContext);
  const { groupMuteButton, groupSoloButton } = React.useContext(ThemeContext);

  const [solo, setSolo] = React.useState(false);
  const [mute, setMute] = React.useState(false);
  const [playerOrder, setPlayerOrder] = React.useState([]);
  const [playerOverrides, setPlayerOverrides] = React.useState([]);

  const groupNode = WAW.getEffects()[id].groupNodes[props.name];

  React.useEffect(() => {
    // solo overrides mute, so only mute when it's exclusive state
    if (mute && !solo) {
      groupNode.current.gain.value = 0;

      // when mute is turned off, add volume if group is not also overridden by another group's solo
    } else if (!mute && !props.soloOverride) {
      groupNode.current.gain.value = 1;
    }

    // if solo is turned on ...
    if (solo) {
      // add override and turn volume on
      props.handleAddSolo(props.name);
      groupNode.current.gain.value = 1;
    }

    if (props.soloOverride === props.name && !solo) {
      // turn off override
      props.handleAddSolo(false);
      // if this group was also on mute, return the volume to that state
      if (mute) {
        groupNode.current.gain.value = 0;
      }
    }
  }, [mute, solo, props, groupNode]);

  React.useEffect(() => {
    // if this group has been overriden by another solo ...
    if (props.soloOverride && props.soloOverride !== props.name) {
      setSolo(false);
      groupNode.current.gain.value = 0;
    }

    // if override has been undone
    if (!props.soloOverride && !mute) {
      groupNode.current.gain.value = 1;
    }
  }, [props.soloOverride, mute, props.name, groupNode]);

  const handleUpdatePlayerOrder = React.useCallback(
    (playerId, newState) => {
      if (newState === "pending-start") {
        if (
          props.currentPolyphony < props.polyphony ||
          props.polyphony === -1
        ) {
          // add this player to the end of the playerOrder list
          setPlayerOrder(playerOrder.concat([playerId]));
        } else {
          // override the latest player to be added to the list, then append the new one
          setPlayerOverrides(playerOverrides.concat(playerOrder[0]));
          setPlayerOrder(playerOrder.slice(1).concat([playerId]));
        }
      } else if (newState === "pending-stop") {
        // remove the player from the playerOrder list
        setPlayerOrder(playerOrder.filter((p) => p !== playerId));
      }
    },
    [props.currentPolyphony, props.polyphony, playerOrder, playerOverrides]
  );

  const handleUpdateOverrides = React.useCallback(
    (playerId) => {
      setPlayerOverrides(playerOverrides.filter((p) => p !== playerId));
    },
    [playerOverrides]
  );

  return (
    <div className="toggle-button-group flex-col">
      <div className="flex-row">
        <h3>
          {props.name} ({props.currentPolyphony} /{" "}
          {props.polyphony === -1 ? props.voices.length : props.polyphony})
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
            key={voice.name}
            name={voice.name}
            groupName={props.name}
            length={voice.length}
            quantizeLength={voice.quantizeLength}
            handleUpdatePlayerOrder={handleUpdatePlayerOrder}
            handleUpdateOverrides={handleUpdateOverrides}
            override={playerOverrides.indexOf(voice.name) !== -1}
          />
        ))}
      </div>
    </div>
  );
};
