import { useContext } from "react";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { ThemeContext } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";
import { useMusicPlayerStore } from "../../stores/musicPlayerStore";
import { flexPanel } from "../../styles/shared/layout.css";
import { buttonWhite, groupedButtons } from "../../styles/shared/buttons.css";
import { cx } from "../../utils/cx";

interface Props {
  handleReset: () => void;
  handleRandomize: () => void;
}

export const ToggleButtonPanel = (props: Props) => {
  const { panelMuteButton } = useContext(ThemeContext)!;

  const mute = useMusicPlayerStore((s) => s.mute);
  const backgroundMode = useMusicPlayerStore((s) => s.backgroundMode);
  const startMute = useMusicPlayerStore((s) => s.startMute);
  const stopMute = useMusicPlayerStore((s) => s.stopMute);

  const { groups } = useContext(SongContext)!;

  return (
    <div id="toggle-button-panel" className={flexPanel}>
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
          className={cx(buttonWhite, groupedButtons)}
          id="toggle-button-panel-reset"
          onClick={props.handleReset}
        >
          Reset
        </button>

        <button
          id="toggle-button-panel-randomize"
          className={cx(buttonWhite, groupedButtons)}
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
          className={cx(buttonWhite, groupedButtons)}
          style={
            mute
              ? {
                  background: panelMuteButton,
                }
              : undefined
          }
          onClick={() => (mute ? stopMute() : startMute())}
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
