// libs
import React from "react";

// components
import { Canvas } from "./canvas/Canvas";

// context
import { ThemeContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";

// hooks
// import { useAnimationFrame } from "../hooks/useAnimationFrame";

// styles
import "../styles/components/Oscilloscope.scss";

export const Oscilloscope = (props) => {
  const { WAW } = React.useContext(WebAudioContext);
  const { spectrumFunction } = React.useContext(ThemeContext);
  const { id } = React.useContext(SongContext);
  const analyser = WAW.getAnalysers(id).groupAnalysers[props.name + "-osc"];
  const canvasRef = React.useRef(null);
  const contextRef = React.useRef(null);

  const render = React.useCallback(
    (canvas, context) => {
      context.lineWidth = canvas.height / 20;
      context.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getTimeData();
      const sliceWidth = canvas.width / (analyser.timeData.length - 1);
      let prevX, prevY;
      let x = 0;
      analyser.timeData.forEach((d, i) => {
        context.beginPath();
        if (props.gradient) {
          context.strokeStyle = spectrumFunction(
            props.index / props.groupCount +
              i / (analyser.timeData.length * props.groupCount)
          );
        }

        const v = d / 128.0;
        const y = (v * canvas.height) / 2;

        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.moveTo(prevX, prevY);
        }

        context.lineTo(x, y);
        prevX = x;
        prevY = y;
        x += sliceWidth;
        context.stroke();
      });
    },
    [analyser, props.gradient, props.groupCount, props.index, spectrumFunction]
  );

  React.useEffect(() => {
    render(canvasRef.current, contextRef.current);
  }, [render]);

  // useAnimationFrame(() =>
  //   props.animate ? render(canvasRef.current, contextRef.current) : () => null
  // );

  return React.useMemo(
    () => (
      <div id="oscilloscope">
        <Canvas
          id="oscilloscope-canvas"
          onLoad={(canvas) => {
            canvasRef.current = canvas;
            contextRef.current = canvas.getContext("2d");
          }}
          onResize={(canvas) => render(canvas, canvas.getContext("2d"))}
        />
      </div>
    ),
    [render]
  );
};
