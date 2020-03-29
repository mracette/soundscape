// libs
import React from "react";

export const Canvas = (props) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const pixelRatio =
      typeof document !== "undefined" ? window.devicePixelRatio : 1;

    const setCanvasSize = () => {
      // resize to device pixel ratio
      canvasRef.current.clientWidth !== 0 &&
        (canvasRef.current.width = pixelRatio * canvasRef.current.clientWidth);

      // height depends on props.makeSquare
      if (props.makeSquare) {
        canvasRef.current.clientHeight !== 0 &&
          (canvasRef.current.height =
            pixelRatio * canvasRef.current.clientWidth);
      } else {
        canvasRef.current.clientHeight !== 0 &&
          (canvasRef.current.height =
            pixelRatio * canvasRef.current.clientHeight);
      }

      // trigger the resize callback
      if (props.resize !== false && props.onResize !== undefined) {
        props.onResize(canvasRef.current);
      }
    };

    // set initial dimensions
    setCanvasSize();

    // unless explicity false, add event listener for resize
    props.resize !== false && window.addEventListener("resize", setCanvasSize);

    // trigger the onload callback
    props.onLoad !== undefined && props.onLoad(canvasRef.current);

    return () =>
      props.resize !== false &&
      window.removeEventListener("resize", setCanvasSize);
  }, [props]);

  return <canvas id={props.id} className={props.className} ref={canvasRef} />;
};
