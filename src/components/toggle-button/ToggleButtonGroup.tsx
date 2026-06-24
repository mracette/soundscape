import {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ToggleButton } from "./ToggleButton";
import { Oscilloscope } from "../Oscilloscope";
import { ThemeContext, VoiceConfig } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";
import { useMusicPlayerStore } from "../../stores/musicPlayerStore";
import "../../styles/components/ToggleButtonGroup.css";
import "../../styles/components/Oscilloscope.css";

interface Props {
  name: string;
  index: number;
  groupCount: number;
  polyphony: number;
  voices: VoiceConfig[];
}

export const ToggleButtonGroup = (props: Props) => {
  const { name } = props;
  const { WAW } = useContext(WebAudioContext)!;
  const { id } = useContext(SongContext)!;
  const { groupMuteButton, groupSoloButton } = useContext(ThemeContext)!;
  const groupSolos = useMusicPlayerStore((s) => s.groupSolos);
  const addResetCallback = useMusicPlayerStore((s) => s.addResetCallback);
  const addRandomizeCallback = useMusicPlayerStore(
    (s) => s.addRandomizeCallback
  );
  const addGroupSolo = useMusicPlayerStore((s) => s.addGroupSolo);
  const removeGroupSolo = useMusicPlayerStore((s) => s.removeGroupSolo);
  const voices = useMusicPlayerStore((s) => s.voices);
  const registerGroup = useMusicPlayerStore((s) => s.registerGroup);

  const [solo, setSolo] = useState(false);
  const [mute, setMute] = useState(false);

  const groupNode = WAW.getEffects(id).groupNodes[name];

  const groupVoices = voices.filter((v) => v.group === name);
  const polyphony = groupVoices.filter(
    (v) => v.voiceState === "pending-start" || v.voiceState === "active"
  ).length;

  useEffect(() => {
    registerGroup(name, props.polyphony);
  }, [registerGroup, name, props.polyphony]);

  /* Solo and Mute Effects */
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
    const handleReset = () => {
      const current = useMusicPlayerStore
        .getState()
        .voices.filter((v) => v.group === name);
      current
        .filter(
          (v) =>
            v.voiceState === "active" || v.voiceState === "pending-start"
        )
        .forEach((v) => v.ref.click());
    };

    const handleRandomize = () => {
      const current = useMusicPlayerStore
        .getState()
        .voices.filter((v) => v.group === name);
      const ePoly = props.polyphony === -1 ? current.length : props.polyphony;
      const count = Math.ceil(Math.random() * ePoly);
      const idsToEnable: string[] = [];
      while (idsToEnable.length < count) {
        const rand = Math.floor(Math.random() * current.length);
        const vid = current[rand].id;
        if (idsToEnable.indexOf(vid) === -1) {
          idsToEnable.push(vid);
        }
      }
      current.forEach((v) => {
        if (idsToEnable.indexOf(v.id) !== -1) {
          if (v.voiceState === "stopped") {
            v.ref.click();
          }
        } else {
          if (v.voiceState !== "stopped") {
            v.ref.click();
          }
        }
      });
    };

    addResetCallback({ name, resetCallback: handleReset });
    addRandomizeCallback({ name, randomizeCallback: handleRandomize });
  }, [addResetCallback, addRandomizeCallback, name, props.polyphony]);

  const handleToggleSolo = useCallback(() => {
    if (solo) {
      removeGroupSolo();
    } else {
      addGroupSolo(name);
    }
  }, [solo, removeGroupSolo, addGroupSolo, name]);

  return (
    <div className="toggle-button-group flex-col">
      <div className="flex-row">
        <h3>
          {name} ({polyphony} /{" "}
          {props.polyphony === -1 ? props.voices.length : props.polyphony}
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
        {useMemo(
          () =>
            props.voices.map((voice) => (
              <ToggleButton
                key={voice.name}
                name={voice.name}
                groupName={name}
                length={voice.length}
                quantizeLength={voice.quantizeLength}
              />
            )),
          [props.voices, name]
        )}
      </div>
    </div>
  );
};
