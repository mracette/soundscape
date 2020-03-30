// libs
import React from "react";
import { gsap } from "gsap";

// context
import { MusicPlayerContext } from "../../contexts/contexts";
import { SongContext } from "../../contexts/contexts";
import { TestingContext } from "../../contexts/contexts";
import { LayoutContext } from "../../contexts/contexts";

// other
import { createAudioPlayer } from "crco-utils";
import { nextSubdivision, getPathToAudio } from "../../utils/audioUtils";
import { AudioPlayerWrapper } from "../../classes/AudioPlayerWrapper";
import { Scheduler } from "../../classes/Scheduler";

// styles
import "../../styles/components/Icon.scss";
import "../../styles/components/ToggleButton.scss";

export const ToggleButton = (props) => {
  const {
    handleUpdatePlayerOrder,
    handleUpdateOverrides,
    name,
    groupName,
    groupNode,
    override,
    length,
  } = props;

  const buttonRef = React.useRef();
  const animationTargetsRef = React.useRef();
  const animationsRef = React.useRef([]);
  const schedulerRef = React.useRef();

  const { vh } = React.useContext(LayoutContext);
  const { id, timeSignature, bpm } = React.useContext(SongContext);
  const { audioCtx, dispatch } = React.useContext(MusicPlayerContext);
  const { flags } = React.useContext(TestingContext);

  const [playerState, setPlayerState] = React.useState("stopped");
  const [player, setPlayer] = React.useState(null);

  const quantizedStartBeats = flags.quantizeSamples ? 4 * timeSignature : 1;
  const buttonRadius = vh ? vh * 3.5 : 0;
  const buttonBorder = vh ? (vh * 3.5) / 15 : 0;

  const changePlayerState = React.useCallback(
    (newState) => {
      const runAnimation = (type, duration) => {
        let strokeDashoffset, points, backgroundColor, rotateZ;

        if (type === "start") {
          rotateZ = "-180";
          backgroundColor = "rgba(255, 255, 255, .3)";
          strokeDashoffset = [
            0,
            2 * Math.PI * (buttonRadius - buttonBorder / 2),
          ];
          points = [
            {
              value:
                "6.69872981 6.69872981 93.01270188 6.69872981 93.01270188 50 93.01270188 93.01270188 6.69872981 93.01270188",
            },
          ];
        } else if (type === "stop") {
          rotateZ = "0";
          backgroundColor = "rgba(255, 255, 255, 0)";
          strokeDashoffset = [
            animationTargetsRef.current.circleSvg.style.strokeDashoffset,
            0,
          ];
          points = [
            {
              value:
                "6.69872981 0 6.69872981 0 93.01270188 50 6.69872981 100 6.69872981 100",
            },
          ];
        }

        // clear previous
        animationsRef.current.forEach((animation) => animation.kill());
        animationsRef.current.length = 0;

        // run cirle animation
        animationsRef.current.push(
          gsap.to(animationTargetsRef.current.circleSvg, {
            strokeDashoffset,
            duration,
            ease: "linear",
          })
        );

        // run icon animation
        // anime({
        //   targets: animationTargetsRef.current.iconPoly,
        //   points,
        //   duration,
        //   easing: "linear",
        // });

        // run rotate animation
        animationsRef.current.push(
          gsap.to(
            [
              animationTargetsRef.current.iconDiv,
              animationTargetsRef.current.iconDiv.children,
            ],
            {
              rotateZ,
              duration,
              ease: "linear",
            }
          )
        );

        // run button animation
        animationsRef.current.push(
          gsap.to(animationTargetsRef.current.button, {
            backgroundColor,
            duration,
            easing: "easeInCubic",
          })
        );
      };

      // clicking a button on pending stop does nothing
      if (playerState !== "pending-stop") {
        // clear future events for this toggle (necessary to stop a pending start)
        schedulerRef.current.clear();

        const initialState =
          newState === "active" ? "pending-start" : "pending-stop";

        // dispatch initial update to music player
        dispatch({
          type: "updatePlayerState",
          payload: {
            id: name,
            newState: initialState,
          },
        });

        // set local state
        setPlayerState(initialState);

        // update poly count for the group
        handleUpdatePlayerOrder(name, initialState);

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
        schedulerRef.current.scheduleOnce(quantizedStartSeconds).then(() => {
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
        });

        // convert to millis for animations
        const secondsToNextStart = quantizedStartSeconds - audioCtx.currentTime;
        const animationType = newState === "stopped" ? "stop" : "start";
        runAnimation(animationType, secondsToNextStart);
      }
    },
    [
      playerState,
      player,
      audioCtx,
      bpm,
      buttonBorder,
      buttonRadius,
      dispatch,
      quantizedStartBeats,
      handleUpdatePlayerOrder,
      name,
    ]
  );

  /* Initialize Player Hook */
  React.useEffect(() => {
    schedulerRef.current = new Scheduler(audioCtx, name);
    const pathToAudio = getPathToAudio(id, name, "vbr");

    createAudioPlayer(audioCtx, pathToAudio, {
      offlineRendering: true,
      renderLength:
        (audioCtx.sampleRate * parseInt(length) * timeSignature * 60) / bpm,
      fade: true,
      fadeLength: 0.025,
    }).then((audioPlayer) => {
      // create the player
      setPlayer(
        new AudioPlayerWrapper(audioCtx, audioPlayer, {
          destination: groupNode,
          loop: true,
        })
      );

      // send reference to music player
      dispatch({
        type: "addPlayer",
        payload: {
          player: {
            id: name,
            groupName: groupName,
            playerState,
            buttonRef: buttonRef.current,
          },
        },
      });
    });

    // store the animation targets based on their relative positions in the DOM
    animationTargetsRef.current = {
      button: buttonRef.current,
      circleSvg: buttonRef.current.children[0],
      iconDiv: buttonRef.current.children[1],
      iconSvg: buttonRef.current.children[1].children[0],
      iconPoly: buttonRef.current.children[1].children[0].children[0],
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Override Hook */
  React.useEffect(() => {
    if (
      override &&
      (playerState === "active" || playerState === "pending-start")
    ) {
      // stop player and remove from the override list
      changePlayerState("stopped");
      handleUpdateOverrides(name);
    }
  }, [playerState, changePlayerState, handleUpdateOverrides, name, override]);

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
            points="6.69872981 0 46.650635094 25 93.01270188 50 46.650635094 75 6.69872981 100"
          />
        </svg>
      </div>
    </button>
  );
};
