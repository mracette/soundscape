import { useRef, useCallback, useEffect, useContext } from "react";
import { SongContext } from "../../contexts/contexts";
import { TestingContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";
import { useMusicPlayerStore, VoiceState } from "../../stores/musicPlayerStore";
import { MusicalDuration } from "../../contexts/contexts";
import {
  ToggleButtonView,
  ToggleButtonViewHandle,
} from "./ToggleButtonView";

interface Props {
  name: string;
  groupName: string;
  length?: MusicalDuration;
  quantizeLength?: MusicalDuration;
}

export const ToggleButton = (props: Props) => {
  const viewRef = useRef<ToggleButtonViewHandle>(null);
  const animationEventRef = useRef<number | undefined>(undefined);

  const { WAW } = useContext(WebAudioContext)!;
  const { id, timeSignature } = useContext(SongContext)!;
  const { flags } = useContext(TestingContext)!;
  const { name, groupName, quantizeLength } = props;
  const addVoice = useMusicPlayerStore((s) => s.addVoice);
  const updateVoiceState = useMusicPlayerStore((s) => s.updateVoiceState);
  const queueVoice = useMusicPlayerStore((s) => s.queueVoice);
  const clearVoiceOverride = useMusicPlayerStore((s) => s.clearVoiceOverride);
  const override =
    useMusicPlayerStore((s) =>
      s.groups[groupName]?.playerOverrides.includes(name)
    ) ?? false;
  const playerState =
    useMusicPlayerStore(
      (s) => s.voices.find((v) => v.id === name)?.voiceState
    ) ?? "stopped";

  const { scheduler, audioCtx } = WAW;
  const player = WAW.getVoices(id)[name];
  const tempoClock = WAW.getTempoClock(id);

  const quantizedStartBeats = flags.quantizeSamples
    ? timeSignature * parseInt(quantizeLength!)
    : 1;

  const changeVoiceState = useCallback(
    (newState: VoiceState) => {
      // drop any pending boundary commit + status change for this toggle
      // (necessary to stop a pending start)
      WAW.cancelBoundary(name);
      scheduler.cancel(animationEventRef.current);

      const initialState: VoiceState =
        newState === "active" ? "pending-start" : "pending-stop";

      updateVoiceState({ id: name, newState: initialState });
      queueVoice(groupName, name, initialState);

      // predicted boundary drives only the visual countdown; the audio start/stop
      // and the status change commit against the live clock at the boundary, so a
      // Time Warp change before then can't bring the voice in off-grid or off-pitch.
      const predictedSeconds = tempoClock.nextBoundary(
        quantizedStartBeats,
        audioCtx.currentTime
      );
      const animationType = newState === "stopped" ? "stop" : "start";
      viewRef.current!.runAnimation(
        animationType,
        (predictedSeconds - audioCtx.currentTime) * 1000
      );

      const action = newState === "active" ? "start" : "stop";
      WAW.scheduleAtBoundary(
        name,
        player,
        tempoClock,
        quantizedStartBeats,
        action,
        (time) => {
          animationEventRef.current = scheduler.scheduleOnce(time, () => {
            updateVoiceState({ id: name, newState });
          }) as number;
        }
      );
    },
    [
      WAW,
      scheduler,
      name,
      audioCtx,
      tempoClock,
      quantizedStartBeats,
      player,
      updateVoiceState,
      queueVoice,
      groupName,
    ]
  );

  /* Initialize Hook */
  useEffect(() => {
    addVoice({
      id: props.name,
      group: props.groupName,
      voiceState: "stopped",
      ref: viewRef.current!.getButton()!,
    });
  }, [id, addVoice, props.groupName, props.name]);

  /* Override Hook */
  useEffect(() => {
    if (
      override &&
      (playerState === "active" || playerState === "pending-start")
    ) {
      // stop player and remove from the override list
      changeVoiceState("stopped");
      clearVoiceOverride(groupName, name);
    }
  }, [playerState, changeVoiceState, name, override, clearVoiceOverride, groupName]);

  /* Cleanup Hook */
  useEffect(() => {
    if (player) {
      return () => {
        WAW.cancelBoundary(name);
        player.stop();
        player.disconnect();
      };
    }
  }, [WAW, name, player]);

  return (
    <ToggleButtonView
      ref={viewRef}
      initialActive={playerState === "active"}
      onClick={() => {
        switch (playerState) {
          case "stopped": // start if stopped
            changeVoiceState("active");
            break;
          case "active": // stop if active
            changeVoiceState("stopped");
            break;
          case "pending-start": // cancel start if triggered on pending-start
            changeVoiceState("stopped");
            break;
          case "pending-stop":
            break; // do nothing if triggered on pending-stop
          default:
            break;
        }
      }}
    />
  );
};
