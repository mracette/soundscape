import { useContext, useRef, useCallback, useEffect, useMemo } from "react";

import { Canvas } from "./canvas/Canvas";

import { ThemeContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";

import { oscilloscope, oscilloscopeCanvas } from "../styles/components/Oscilloscope.css";

interface Props {
  name: string;
  gradient?: boolean;
  index?: number;
  groupCount?: number;
  animate?: boolean;
}

export const Oscilloscope = (props: Props) => {
  const { WAW } = useContext(WebAudioContext)!;
  const { spectrumFunction } = useContext(ThemeContext)!;
  const { id } = useContext(SongContext)!;
  const analyser = WAW.getAnalysers(id).groupAnalysers[props.name + "-osc"];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const render = useCallback(
    (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
      context.lineWidth = canvas.height / 20;
      context.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getTimeData();
      const timeData = analyser.timeData as Uint8Array;
      const sliceWidth = canvas.width / (timeData.length - 1);
      let prevX: number, prevY: number;
      let x = 0;
      timeData.forEach((d, i) => {
        context.beginPath();
        if (props.gradient) {
          context.strokeStyle = spectrumFunction(
            props.index! / props.groupCount! +
              i / (timeData.length * props.groupCount!)
          ) as string;
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

  useEffect(() => {
    render(canvasRef.current!, contextRef.current!);
  }, [render]);

  // useAnimationFrame(() =>
  //   props.animate ? render(canvasRef.current, contextRef.current) : () => null
  // );

  return useMemo(
    () => (
      <div id="oscilloscope" className={oscilloscope}>
        <Canvas
          id="oscilloscope-canvas"
          className={oscilloscopeCanvas}
          onLoad={(canvas) => {
            canvasRef.current = canvas;
            contextRef.current = canvas.getContext("2d");
          }}
          onResize={(canvas) => render(canvas, canvas.getContext("2d")!)}
        />
      </div>
    ),
    [render]
  );
};
