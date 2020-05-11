// libs
import React from "react";
import anime from "animejs/lib/anime.es.js";

// context
import { SongContext } from "../../contexts/contexts";
import { TestingContext } from "../../contexts/contexts";
import { LayoutContext } from "../../contexts/contexts";
import { WebAudioContext } from "../../contexts/contexts";
import { MusicPlayerContext } from "../../contexts/contexts";

// other
import { nextSubdivision } from "../../utils/audioUtils";

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

export const ToggleButton = (props) => {
  const buttonRef = React.useRef();
  const animationTargetsRef = React.useRef();
  const animationEventRef = React.useRef();

  const { WAW } = React.useContext(WebAudioContext);
  const { vh } = React.useContext(LayoutContext);
  const { id, timeSignature, bpm } = React.useContext(SongContext);
  const { flags } = React.useContext(TestingContext);
  const musicPlayerDispatch = React.useContext(MusicPlayerContext).dispatch;
  const { dispatch, name, override, quantizeLength } = props;

  const { scheduler, audioCtx } = WAW;
  const player = WAW.getVoices(id)[name];

  const [playerState, setPlayerState] = React.useState("stopped");

  const quantizedStartBeats = flags.quantizeSamples
    ? timeSignature * parseInt(quantizeLength)
    : 1;
  const buttonRadius = vh ? vh * 3.5 : 0;
  const buttonBorder = vh ? (vh * 3.5) / 15 : 0;

  const changePlayerState = React.useCallback(
    (newState) => {
      const runAnimation = (type, duration) => {
        // clear queue
        anime.remove(animationTargetsRef.current.circleSvg);
        anime.remove(animationTargetsRef.current.iconPoly);
        anime.remove(animationTargetsRef.current.iconDiv);
        anime.remove(animationTargetsRef.current.iconDiv.children);
        anime.remove(animationTargetsRef.current.button);

        let strokeDashoffset, points, backgroundColor, rotateZ;

        if (type === "start") {
          rotateZ = START_PARAMS.rotateZ;
          backgroundColor = START_PARAMS.backgroundColor;
          strokeDashoffset = [
            0,
            2 * Math.PI * (buttonRadius - buttonBorder / 2),
          ];
          points = [
            {
              value: START_PARAMS.points,
            },
          ];
        } else if (type === "stop") {
          rotateZ = STOP_PARAMS.rotateZ;
          backgroundColor = STOP_PARAMS.backgroundColor;
          strokeDashoffset = [
            animationTargetsRef.current.circleSvg.style.strokeDashoffset,
            0,
          ];
          points = [
            {
              value: STOP_PARAMS.points,
            },
          ];
        }

        // run cirle animation
        anime({
          targets: animationTargetsRef.current.circleSvg,
          strokeDashoffset,
          duration,
          easing: "linear",
        });

        // run icon animation
        anime({
          targets: animationTargetsRef.current.iconPoly,
          points,
          duration,
          easing: "linear",
        });

        // run rotate animation
        anime({
          targets: [
            animationTargetsRef.current.iconDiv,
            animationTargetsRef.current.iconDiv.children,
          ],
          rotateZ,
          duration,
          easing: "linear",
        });

        // run button animation
        anime({
          targets: animationTargetsRef.current.button,
          backgroundColor,
          duration,
          easing: "easeInCubic",
        });
      };

      // cancel current event for this toggle (necessary to stop a pending start)
      scheduler.cancel(animationEventRef.current);

      const initialState =
        newState === "active" ? "pending-start" : "pending-stop";

      dispatch({
        type: "updatePlayerState",
        payload: {
          id: name,
          newState: initialState,
        },
      });

      musicPlayerDispatch({
        type: "updateVoiceState",
        payload: {
          id: props.name,
          newState: initialState,
        },
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
          musicPlayerDispatch({
            type: "updateVoiceState",
            payload: {
              id: props.name,
              newState,
            },
          });
        }
      );

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
      musicPlayerDispatch,
      props.name,
    ]
  );

  /* Initialize Hook */
  React.useEffect(() => {
    // store the animation targets based on their relative positions in the DOM
    animationTargetsRef.current = {
      button: buttonRef.current,
      circleSvg: buttonRef.current.children[0],
      iconDiv: buttonRef.current.children[1],
      iconSvg: buttonRef.current.children[1].children[0],
      iconPoly: buttonRef.current.children[1].children[0].children[0],
    };

    dispatch({
      type: "addPlayer",
      payload: {
        player: {
          id: props.name,
          playerState: "stopped",
          ref: buttonRef.current,
        },
      },
    });

    musicPlayerDispatch({
      type: "addVoice",
      payload: {
        id: props.name,
        group: props.groupName,
        voiceState: "stopped",
        ref: buttonRef.current,
      },
    });
  }, [dispatch, id, musicPlayerDispatch, props.groupName, props.name]);

  /* Override Hook */
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (player) {
      return () => {
        player.stop();
        player.disconnect();
      };
    }
  }, [player]);

  return (
    <button
      className="toggle-button"
      ref={buttonRef}
      onClick={(e) => {
        // e.preventDefault();
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
