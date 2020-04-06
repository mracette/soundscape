// libs
import React from "react";

// components
import { ToggleButtonGroup } from "./ToggleButtonGroup";

// contexts
import { ThemeContext } from "../../contexts/contexts";
import { MusicPlayerContext } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";

// styles
import "../../styles/components/ToggleButtonPanel.scss";

export const ToggleButtonPanel = (props) => {
  const { panelMuteButton } = React.useContext(ThemeContext);

  const { dispatch, mute, backgroundMode } = React.useContext(
    MusicPlayerContext
  );

  const { groups } = React.useContext(SongContext);

  return (
    <div id="toggle-button-panel" className="flex-panel">
      <div className="flex-row" style={{ justifyContent: "space-between" }}>
        <div className="flex-col">
          <h2>Voices</h2>
        </div>
        <div className="flex-col">
          {backgroundMode && <p className="hot-green">background mode: on</p>}
        </div>
      </div>

      <div className="flex-row">
        <button
          className="button-white grouped-buttons"
          id="toggle-button-panel-reset"
          onClick={props.handleReset}
        >
          Reset
        </button>

        <button
          id="toggle-button-panel-randomize"
          className="button-white grouped-buttons"
          onClick={props.handleRandomize}
        >
          Randomize
        </button>

        {/* <button
                    id='toggle-button-panel-randomize'
                    className='button-white grouped-buttons'
                    style={randomize ? {
                        background: panelRandomizeButton
                    } : undefined}
                    onClick={() => randomize ? dispatch({ type: 'stopRandomize' }) : dispatch({ type: 'startRandomize' })}
                >
                    Background Mode
                    </button> */}

        <button
          id="toggle-button-panel-mute"
          className="button-white grouped-buttons"
          style={
            mute
              ? {
                  background: panelMuteButton,
                }
              : undefined
          }
          onClick={() =>
            mute
              ? dispatch({ type: "stopMute" })
              : dispatch({ type: "startMute" })
          }
        >
          Mute
        </button>
      </div>

      {groups.map((group, index) => (
        <ToggleButtonGroup
          index={index}
          key={group.name}
          name={group.name}
          groupCount={groups.length}
          polyphony={group.polyphony}
          voices={group.voices}
        />
      ))}
    </div>
  );
};
