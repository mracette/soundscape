import { useContext } from "react";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { SongContext } from "../../contexts/contexts";
import { useMusicPlayerStore } from "../../stores/musicPlayerStore";
import { flexPanel } from "../../styles/shared/layout.css";
import {
  pillButton,
  pillButtonActive,
  pillButtonEven,
  pillRow,
} from "../../styles/shared/buttons.css";
import { panelButtonRow } from "../../styles/components/ToggleButtonPanel.css";
import { cx } from "../../utils/cx";

interface Props {
  handleReset: () => void;
  handleRandomize: () => void;
}

export const ToggleButtonPanel = (props: Props) => {
  const mute = useMusicPlayerStore((s) => s.mute);
  const backgroundMode = useMusicPlayerStore((s) => s.backgroundMode);
  const startMute = useMusicPlayerStore((s) => s.startMute);
  const stopMute = useMusicPlayerStore((s) => s.stopMute);
  const removeGroupSolo = useMusicPlayerStore((s) => s.removeGroupSolo);

  const { groups } = useContext(SongContext)!;

  // Reset returns the whole panel to its default listening state, so the
  // per-group voice resets are joined by dropping the mute pill and any solo.
  // Each group clears its own M as part of its registered reset callback.
  const handleReset = () => {
    props.handleReset();
    stopMute();
    removeGroupSolo();
  };

  return (
    <div id="toggle-button-panel" className={flexPanel}>
      <div
        className="flex-row"
        style={{ justifyContent: "space-between", alignItems: "end" }}
      >
        <h2>Voices</h2>
        <div className="flex-col">
          {backgroundMode && <p>background mode: on</p>}
        </div>
      </div>

      <div className={cx(pillRow, panelButtonRow)}>
        <button
          className={cx(pillButton, pillButtonEven)}
          id="toggle-button-panel-reset"
          onClick={handleReset}
        >
          Reset
        </button>

        <button
          id="toggle-button-panel-randomize"
          className={cx(pillButton, pillButtonEven)}
          onClick={props.handleRandomize}
        >
          Randomize
        </button>

        <button
          id="toggle-button-panel-mute"
          className={cx(pillButton, pillButtonEven, mute && pillButtonActive)}
          aria-pressed={mute}
          onClick={() => (mute ? stopMute() : startMute())}
        >
          Mute
        </button>
      </div>

      {groups.map((group) => (
        <ToggleButtonGroup
          key={group.name}
          name={group.name}
          polyphony={group.polyphony}
          voices={group.voices}
        />
      ))}
    </div>
  );
};
