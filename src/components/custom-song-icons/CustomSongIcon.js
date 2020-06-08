// libs
import React from "react";
import { CanvasCoordinates } from "crco-utils";

// components
import { Canvas } from "../canvas/Canvas";

// styles
import "../../styles/components/LandingPage.scss";

const speed = 0.001;

export function CustomSongIcon(props) {
  const canvasRef = React.useRef(null);
  const contextRef = React.useRef();
  const cycleRef = React.useRef(0);
  const timeRef = React.useRef(0);
  const animationRef = React.useRef();
  const coordsRef = React.useRef();

  const { animate, id, listen, setCustomStyles, dispatch, isNew } = props;

  React.useEffect(() => {
    const updateCanvas = (time, loop, reset) => {
      const delta = reset ? 0 : time - timeRef.current;
      cycleRef.current += delta * speed;
      timeRef.current = time;

      contextRef.current.clearRect(
        coordsRef.current.nx(-1),
        coordsRef.current.ny(-1),
        coordsRef.current.getWidth(),
        coordsRef.current.getHeight()
      );

      animate(contextRef.current, cycleRef.current, coordsRef.current);

      if (loop) {
        animationRef.current = window.requestAnimationFrame((time) =>
          updateCanvas(time, true)
        );
      }
    };

    const handleSetSelected = () => dispatch({ type: props.name });
    const handleUnsetSelected = () => dispatch({ type: null });

    const setStyles = () => {
      contextRef.current.lineWidth = coordsRef.current.getWidth() / 128;
      contextRef.current.strokeStyle = "#f6f2d5";
      contextRef.current.fillStyle = "#f6f2d5";
      setCustomStyles && setCustomStyles(contextRef.current);
    };

    const beginAnimation = () => {
      setStyles();
      animationRef.current = window.requestAnimationFrame((time) =>
        updateCanvas(time, true, true)
      );
    };

    const stopAnimation = () => {
      window.cancelAnimationFrame(animationRef.current);
    };

    if (listen) {
      // add listeners
      canvasRef.current.addEventListener("touchstart", beginAnimation);
      canvasRef.current.addEventListener("touchstart", handleSetSelected);
      canvasRef.current.addEventListener("touchstart", stopAnimation);
      canvasRef.current.addEventListener("touchstart", handleUnsetSelected);

      canvasRef.current.addEventListener("mouseover", beginAnimation);
      canvasRef.current.addEventListener("mouseover", handleSetSelected);
      canvasRef.current.addEventListener("mouseout", stopAnimation);
      canvasRef.current.addEventListener("mouseout", handleUnsetSelected);
    }

    // set up canvas/coords and initialize drawing
    coordsRef.current = new CanvasCoordinates({
      canvas: canvasRef.current,
      padding: 0.02,
    });
    contextRef.current = canvasRef.current.getContext("2d");
    setStyles();
    updateCanvas(0, false, false);

    if (!listen) {
      beginAnimation();
    }

    // cleanup
    return () => {
      stopAnimation();
      if (listen) {
        canvasRef.current.removeEventListener("touchstart", beginAnimation);
        canvasRef.current.removeEventListener("touchstart", handleSetSelected);
        canvasRef.current.removeEventListener("touchstart", stopAnimation);
        canvasRef.current.removeEventListener(
          "touchstart",
          handleUnsetSelected
        );

        canvasRef.current.removeEventListener("mouseover", beginAnimation);
        canvasRef.current.removeEventListener("mouseover", handleSetSelected);
        canvasRef.current.removeEventListener("mouseout", stopAnimation);
        canvasRef.current.removeEventListener("mouseout", handleUnsetSelected);
      }
    };
  }, [dispatch, props.name, animate, listen, setCustomStyles]);

  return React.useMemo(() => {
    return (
      <div
        style={{
          position: "relative",
          // border: isNew ? "1px solid" : "0px solid",
        }}
      >
        {isNew && <span className="new-label">New!</span>}
        <Canvas
          id={id}
          className="custom-song-icon"
          onLoad={(canvas) => (canvasRef.current = canvas)}
          resize={false}
        />
      </div>
    );
  }, [id, isNew]);
}
