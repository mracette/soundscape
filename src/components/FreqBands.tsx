import { useContext, useRef, useCallback, useMemo } from "react";

import { Canvas } from "./canvas/Canvas";

import { useAnimationFrame } from "../hooks/useAnimationFrame";

import { ThemeContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";

import { freqBands, freqBandsCanvas } from "../styles/components/FreqBands.css";

interface Props {
  animate?: boolean;
}

export const FreqBands = (props: Props) => {
  const { spectrumFunction } = useContext(ThemeContext)!;
  const { bpm, timeSignature } = useContext(SongContext)!;
  const { WAW } = useContext(WebAudioContext)!;
  const analyser = WAW.getAnalysers().premaster!;

  const secondsPerBar = (60 / bpm) * timeSignature;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const render = useCallback(
    (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, time: number) => {
      const fftData = analyser.fftData as Uint8Array;
      const radius =
        canvas.height / 2 - canvas.height / analyser.frequencyBinCount;

      // calculate cycle time
      const cycleTime = time / 1000 / (secondsPerBar * 4);

      // clear previous draw
      context.clearRect(0, 0, canvas.height, canvas.height);

      // refresh fft data
      analyser.getFrequencyData();

      // map time domain data to canvas draw actions
      fftData.forEach((d, i) => {
        const vol = d / 255;
        const cx =
          canvas.width / 2 +
          radius *
            Math.cos(
              (i / analyser.frequencyBinCount) * 2 * Math.PI +
                cycleTime * Math.PI * 2
            );
        const cy =
          canvas.height / 2 +
          radius *
            Math.sin(
              (i / analyser.frequencyBinCount) * 2 * Math.PI +
                cycleTime * Math.PI * 2
            );

        context.beginPath();

        context.fillStyle = spectrumFunction(i / analyser.frequencyBinCount) as string;

        context.moveTo(cx, cy);

        context.arc(
          cx,
          cy,
          (canvas.height / analyser.frequencyBinCount) * vol,
          0,
          Math.PI * 2
        );

        context.fill();
      });
    },
    [analyser, secondsPerBar, spectrumFunction]
  );

  useAnimationFrame((t) =>
    props.animate
      ? render(canvasRef.current!, contextRef.current!, t.time)
      : () => null
  );

  return useMemo(
    () => (
      <div id="freq-bands" className={freqBands}>
        <Canvas
          id="freq-bands-canvas"
          className={freqBandsCanvas}
          onLoad={(canvas) => {
            canvasRef.current = canvas;
            contextRef.current = canvas.getContext("2d");
          }}
        />
      </div>
    ),
    []
  );
};
