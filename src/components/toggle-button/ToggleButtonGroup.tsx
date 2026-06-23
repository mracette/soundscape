// libs
import {
  useContext,
  useReducer,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// components
import { ToggleButton } from "./ToggleButton";
import { Oscilloscope } from "../Oscilloscope";

// contexts
import { ThemeContext, VoiceConfig } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";

// store
import { useMusicPlayerStore } from "../../stores/musicPlayerStore";

// reducers
import { ToggleButtonGroupReducer } from "../../reducers/ToggleButtonGroupReducer";

// styles
import "../../styles/components/ToggleButtonGroup.scss";
import "../../styles/components/Oscilloscope.scss";

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
  const [state, dispatch] = useReducer(ToggleButtonGroupReducer, {
    maxPolyphony: props.polyphony,
    polyphony: 0,
    players: [],
    playerOrder: [],
    playerOverrides: [],
  });

  const [solo, setSolo] = useState(false);
  const [mute, setMute] = useState(false);

  const groupNode = (WAW.getEffects(id) as { groupNodes: Record<string, GainNode> }).groupNodes[name];

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
      const playersToEnable: string[] = [];
      // choose a random player from the set
      while (playersToEnable.length < count) {
        const rand = Math.floor(Math.random() * state.players.length);
        const pid = state.players[rand].id;
        if (playersToEnable.indexOf(pid) === -1) {
          playersToEnable.push(pid);
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

    // LATENT BUG: store's ResetCallback/RandomizeCallback are callable interfaces ({ name; (): void }),
    // but these objects are plain { name, resetCallback/randomizeCallback } — not callable.
    // Preserving the existing runtime behavior with casts.
    addResetCallback({ name, resetCallback: handleReset } as any);
    addRandomizeCallback({ name, randomizeCallback: handleRandomize } as any);
  }, [
    addResetCallback,
    addRandomizeCallback,
    name,
    state.maxPolyphony,
    state.players,
    state.polyphony,
  ]);

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
        {useMemo(
          () =>
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
