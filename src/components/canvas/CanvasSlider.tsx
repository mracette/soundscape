import { useRef } from "react";
import { clamp } from "../../utils/mathUtils";

import { Canvas } from "./Canvas";
import {
  canvasSlider,
  canvasSliderWrapper,
} from "../../styles/components/EffectsPanel.css";

const thumbRadius = 1 / 4;
const trackHeight = 1 / 12;
const hotGreen = "rgb(0, 225, 158)";

interface Props {
  id?: string;
  reverse?: boolean;
  minValue?: number;
  maxValue?: number;
  value: number;
  handleValue: (value: number) => void;
}

export const CanvasSlider = (props: Props) => {
  const reverse = props.reverse || false;
  const minValue = props.minValue || 1;
  const maxValue = props.maxValue || 100;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const handleMouseOrTouchDown = (startPosition: number, startValue: number) => {
    // disable selections while the mouse is down
    document.onselectstart = () => false;
    const onMouseOrTouchMove = (e: MouseEvent | TouchEvent) => {
      const x = (e as MouseEvent).clientX || ((e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : 0);
      const delta = parseFloat(String(x - startPosition));
      const multiplier = (maxValue - minValue) / canvasRef.current!.clientWidth;
      const newValue = clamp(startValue + delta * multiplier, minValue, maxValue);
      props.handleValue(newValue);
    };
    document.onmousemove = (e) => onMouseOrTouchMove(e);
    document.ontouchmove = (e) => {
      onMouseOrTouchMove(e);
    };
    // remove listeners
    document.onmouseup = () => {
      document.onselectstart = null;
      document.onmousemove = null;
    };
    document.ontouchend = () => {
      document.onselectstart = null;
      document.ontouchmove = null;
    };
  };

  const render = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    const radius = canvas.height * thumbRadius;
    const track = canvas.height * trackHeight;
    const activeValue =
      radius +
      ((props.value - minValue) / (maxValue - minValue)) *
        (canvas.width - 2 * radius);
    context.fillStyle = "white";
    context.lineWidth = track;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = !reverse ? hotGreen : "white";
    context.beginPath();
    context.moveTo(0, canvas.height / 2);
    context.lineTo(activeValue, canvas.height / 2);
    context.stroke();
    context.strokeStyle = !reverse ? "white" : hotGreen;
    context.beginPath();
    context.moveTo(activeValue, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();
    context.strokeStyle = "white";
    context.arc(activeValue, canvas.height / 2, radius, 0, Math.PI * 2);
    context.fill();
  };
  return (
    <div
      className={canvasSliderWrapper}
      onMouseDown={(e) => {
        e.preventDefault();
        const startPosition = parseFloat(String(e.clientX));
        const startValue = parseFloat(String(props.value));
        handleMouseOrTouchDown(startPosition, startValue);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        const startPosition = parseFloat(String(e.touches[0].clientX));
        const startValue = parseFloat(String(props.value));
        handleMouseOrTouchDown(startPosition, startValue);
      }}
    >
      <Canvas
        id={props.id}
        className={canvasSlider}
        onLoad={(canvas) => {
          canvasRef.current = canvas;
          contextRef.current = canvas.getContext("2d");
          render(canvasRef.current, contextRef.current!);
        }}
        onResize={(canvas) => {
          canvasRef.current = canvas;
          contextRef.current = canvas.getContext("2d");
          render(canvasRef.current, contextRef.current!);
        }}
      />
    </div>
  );
};
