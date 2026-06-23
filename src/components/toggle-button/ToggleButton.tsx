// libs
import { useRef, useState, useCallback, useEffect, useContext } from "react";
import { gsap } from "gsap";

// context
import { SongContext } from "../../contexts/contexts";
import { TestingContext } from "../../contexts/contexts";
import { LayoutContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";

// store
import { useMusicPlayerStore } from "../../stores/musicPlayerStore";

// other
import { nextSubdivision } from "../../utils/audioUtils";

// reducers
import { Action } from "../../reducers/ToggleButtonGroupReducer";

// styles
import "../../styles/components/Icon.scss";
import "../../styles/components/ToggleButton.scss";

const START_PARAMS = {
  rotateZ: "-180",
  backgroundColor: "rgba(255, 255, 255, .3)",
  points:
    "6.69872981 6.69872981 93.01270188 6.69872981 93.01270188 50 93.01270188 93.01270188 6.69872981 93.01270188",
};

const STOP_PARAMS = {
  rotateZ: "0",
  backgroundColor: "rgba(255, 255, 255, 0)",
  points:
    "6.69872981 0 6.69872981 0 93.01270188 50 6.69872981 100 6.69872981 100",
};

type PlayerState = "stopped" | "pending-start" | "active" | "pending-stop";

interface AnimationTargets {
  button: HTMLButtonElement;
  circleSvg: Element;
  iconDiv: Element;
  iconSvg: Element;
  iconPoly: Element;
}

interface Props {
  dispatch: (action: Action) => void;
  name: string;
  groupName: string;
  length?: string;
  quantizeLength?: string;
  override: boolean;
}

export const ToggleButton = (props: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationTargetsRef = useRef<AnimationTargets | null>(null);
  const animationEventRef = useRef<number | undefined>(undefined);

  const { WAW } = useContext(WebAudioContext)!;
  const { vh } = useContext(LayoutContext)!;
  const { id, timeSignature, bpm } = useContext(SongContext)!;
  const { flags } = useContext(TestingContext)!;
  const addVoice = useMusicPlayerStore((s) => s.addVoice);
  const updateVoiceState = useMusicPlayerStore((s) => s.updateVoiceState);
  const { dispatch, name, override, quantizeLength } = props;

  const { scheduler, audioCtx } = WAW;
  const player = WAW.getVoices(id)[name];

  const [playerState, setPlayerState] = useState<PlayerState>("stopped");

  const quantizedStartBeats = flags.quantizeSamples
    ? timeSignature * parseInt(quantizeLength!)
    : 1;
  const buttonRadius = vh ? vh * 3.5 : 0;
  const buttonBorder = vh ? (vh * 3.5) / 15 : 0;

  const changePlayerState = useCallback(
    (newState: PlayerState) => {
      const runAnimation = (type: "start" | "stop", duration: number) => {
        const seconds = duration / 1000;
        const targets = animationTargetsRef.current!;

        // clear queue
        gsap.killTweensOf(targets.circleSvg);
        gsap.killTweensOf(targets.iconPoly);
        gsap.killTweensOf(targets.iconDiv);
        gsap.killTweensOf([...targets.iconDiv.children]);
        gsap.killTweensOf(targets.button);

        let points: string | undefined;
        let backgroundColor: string | undefined;
        let rotateZ: number;

        if (type === "start") {
          rotateZ = -180;
          backgroundColor = START_PARAMS.backgroundColor;
          points = START_PARAMS.points;

          // sweep always begins from a 0 offset regardless of current value
          gsap.fromTo(
            targets.circleSvg,
            { strokeDashoffset: 0 },
            {
              strokeDashoffset: 2 * Math.PI * (buttonRadius - buttonBorder / 2),
              duration: seconds,
              ease: "none",
            }
          );
        } else {
          rotateZ = 0;
          backgroundColor = STOP_PARAMS.backgroundColor;
          points = STOP_PARAMS.points;

          // run circle animation
          gsap.to(targets.circleSvg, {
            strokeDashoffset: 0,
            duration: seconds,
            ease: "none",
          });
        }

        // run icon animation (morph polygon points)
        gsap.to(targets.iconPoly, {
          attr: { points },
          duration: seconds,
          ease: "none",
        });

        // run rotate animation
        gsap.to(
          [targets.iconDiv, ...targets.iconDiv.children],
          {
            rotation: rotateZ,
            duration: seconds,
            ease: "none",
          }
        );

        // run button animation
        gsap.to(targets.button, {
          backgroundColor,
          duration: seconds,
          ease: "power2.in",
        });
      };

      // cancel current event for this toggle (necessary to stop a pending start)
      scheduler.cancel(animationEventRef.current);

      const initialState: PlayerState =
        newState === "active" ? "pending-start" : "pending-stop";

      dispatch({
        type: "updatePlayerState",
        payload: {
          id: name,
          newState: initialState,
        },
      });

      updateVoiceState({
        id: props.name,
        newState: initialState,
      });

      setPlayerState(initialState);

      dispatch({
        type: "updatePlayerOrder",
        payload: {
          playerId: name,
          newState: initialState,
        },
      });

      // calculate time till next loop start
      const quantizedStartSeconds = nextSubdivision(
        audioCtx,
        bpm,
        quantizedStartBeats
      );

      switch (newState) {
        case "active":
          player.start(quantizedStartSeconds);
          break;
        case "stopped":
          player.stop(quantizedStartSeconds);
          break;
        default:
          break;
      }

      // schedule a status change
      animationEventRef.current = scheduler.scheduleOnce(
        quantizedStartSeconds,
        () => {
          // update local state
          setPlayerState(newState);
          // dispatch final update to music player
          dispatch({
            type: "updatePlayerState",
            payload: {
              id: name,
              newState: newState,
            },
          });
          updateVoiceState({
            id: props.name,
            newState,
          });
        }
      ) as number;

      // convert to millis for animations
      const quantizedStartMillis =
        (quantizedStartSeconds - audioCtx.currentTime) * 1000;
      const animationType = newState === "stopped" ? "stop" : "start";
      runAnimation(animationType, quantizedStartMillis);
    },
    [
      scheduler,
      dispatch,
      name,
      audioCtx,
      bpm,
      quantizedStartBeats,
      buttonRadius,
      buttonBorder,
      player,
      updateVoiceState,
      props.name,
    ]
  );

  /* Initialize Hook */
  useEffect(() => {
    const btn = buttonRef.current!;
    // store the animation targets based on their relative positions in the DOM
    animationTargetsRef.current = {
      button: btn,
      circleSvg: btn.children[0],
      iconDiv: btn.children[1],
      iconSvg: btn.children[1].children[0],
      iconPoly: btn.children[1].children[0].children[0],
    };

    dispatch({
      type: "addPlayer",
      payload: {
        player: {
          id: props.name,
          playerState: "stopped",
          ref: btn,
        },
      },
    });

    addVoice({
      id: props.name,
      group: props.groupName,
      voiceState: "stopped",
      ref: btn,
    });
  }, [dispatch, id, addVoice, props.groupName, props.name]);

  /* Override Hook */
  useEffect(() => {
    if (
      override &&
      (playerState === "active" || playerState === "pending-start")
    ) {
      // stop player and remove from the override list
      changePlayerState("stopped");
      dispatch({ type: "updatePlayerOverrides", payload: { playerId: name } });
    }
  }, [playerState, changePlayerState, name, override, dispatch]);

  /* Cleanup Hook */
  useEffect(() => {
    if (player) {
      return () => {
        // LATENT BUG: AudioPlayerWrapper.stop() requires a number arg; called here without one
        (player.stop as (t?: number) => void)();
        player.disconnect();
      };
    }
  }, [player]);

  return (
    <button
      className="toggle-button"
      ref={buttonRef}
      onClick={() => {
        switch (playerState) {
          case "stopped": // start if stopped
            changePlayerState("active");
            break;
          case "active": // stop if active
            changePlayerState("stopped");
            break;
          case "pending-start": // cancel start if triggered on pending-start
            changePlayerState("stopped");
            break;
          case "pending-stop":
            break; // do nothing if triggered on pending-stop
          default:
            break;
        }
      }}
      style={{
        cursor: "pointer",
        height: buttonRadius * 2,
        width: buttonRadius * 2,
      }}
    >
      <svg
        className="svg"
        width={2 * buttonRadius}
        height={2 * buttonRadius}
        style={{
          strokeDashoffset:
            playerState === "active"
              ? 2 * Math.PI * (buttonRadius - buttonBorder / 2)
              : 0,
        }}
      >
        <circle
          className="svg-circle"
          cx={buttonRadius}
          cy={buttonRadius}
          r={buttonRadius - buttonBorder / 2}
          style={{
            strokeWidth: buttonBorder,
            strokeDasharray: 2 * Math.PI * (buttonRadius - buttonBorder / 2),
          }}
        />
      </svg>

      <div className={`scale-div-morph toggle-icon`}>
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className={`toggle-icon icon-white`}
        >
          <polygon
            id="icon-play3-poly"
            className={`icon icon-white`}
            points={STOP_PARAMS.points}
          />
        </svg>
      </div>
    </button>
  );
};
