// libs
import React from "react";
import { clamp } from "crco-utils";

// components
import { Canvas } from "./Canvas";

const thumbRadius = 1 / 4;
const trackHeight = 1 / 12;
const hotGreen = "rgb(0, 225, 158)";

export const CanvasSlider = (props) => {
  const reverse = props.reverse || false;
  const minValue = props.minValue || 1;
  const maxValue = props.maxValue || 100;
  const canvasRef = React.useRef(null);
  const contextRef = React.useRef(null);

  const handleMouseOrTouchDown = (startPosition, startValue) => {
    // disable selections while the mouse is down
    document.onselectstart = () => false;
    const onMouseOrTouchMove = (e) => {
      const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
      const delta = parseFloat(x - startPosition);
      const multiplier = (maxValue - minValue) / canvasRef.current.clientWidth;
      let newValue = clamp(startValue + delta * multiplier, minValue, maxValue);
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

  const render = (canvas, context) => {
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
      className="canvas-slider-wrapper"
      onMouseDown={(e) => {
        e.preventDefault();
        const startPosition = parseFloat(e.clientX);
        const startValue = parseFloat(props.value);
        handleMouseOrTouchDown(startPosition, startValue);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        const startPosition = parseFloat(e.touches[0].clientX);
        const startValue = parseFloat(props.value);
        handleMouseOrTouchDown(startPosition, startValue);
      }}
    >
      <Canvas
        id={props.id}
        className="canvas-slider"
        onLoad={(canvas) => {
          canvasRef.current = canvas;
          contextRef.current = canvas.getContext("2d");
          render(canvasRef.current, contextRef.current);
        }}
        onResize={(canvas) => {
          canvasRef.current = canvas;
          contextRef.current = canvas.getContext("2d");
          render(canvasRef.current, contextRef.current);
        }}
      />
    </div>
  );
};
