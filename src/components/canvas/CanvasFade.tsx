import { useRef, useEffect, RefObject } from "react";

const trackParentSize = (child: HTMLCanvasElement, parent: HTMLCanvasElement) => {
  const rect = parent.getBoundingClientRect();
  child.style.top = `${rect.top}px`;
  child.style.left = `${rect.left}px`;
  child.style.width = `${rect.width}px`;
  child.style.height = `${rect.height}px`;
  child.width = parent.width;
  child.height = parent.height;
};

const drawFade = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
  const gradientSize = Math.round(canvas.width / 30);
  const startColor = "rgba(0, 0, 0, 0)";
  const endColor = "rgba(0, 0, 0, 1)";

  // corners first
  for (let i = 0; i < 4; i++) {
    let x: number | undefined, y: number | undefined, gx: number | undefined, gy: number | undefined;
    switch (i.toString()) {
      case "0": {
        x = 0;
        y = 0;
        gx = x + gradientSize;
        gy = y + gradientSize;
        break;
      }
      case "1": {
        x = canvas.width - gradientSize;
        y = 0;
        gx = canvas.width - gradientSize;
        gy = gradientSize;
        break;
      }
      case "2": {
        x = canvas.width - gradientSize;
        y = canvas.height - gradientSize;
        gx = canvas.width - gradientSize;
        gy = canvas.height - gradientSize;
        break;
      }
      case "3": {
        x = 0;
        y = canvas.height - gradientSize;
        gx = gradientSize;
        gy = canvas.height - gradientSize;
        break;
      }
      default:
        break;
    }
    const gradient = context.createRadialGradient(
      gx!,
      gy!,
      0,
      gx!,
      gy!,
      gradientSize
    );
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    context.fillStyle = gradient;
    context.fillRect(x!, y!, gradientSize, gradientSize);
  }

  // sides
  for (let i = 0; i < 4; i++) {
    let x: number | undefined, y: number | undefined, w: number | undefined, h: number | undefined;
    let gx: number | undefined, gy: number | undefined, gxx: number | undefined, gyy: number | undefined;
    switch (i.toString()) {
      case "0": {
        x = gradientSize;
        y = 0;
        w = canvas.width - 2 * gradientSize;
        h = gradientSize;
        gx = 0;
        gy = gradientSize;
        gxx = 0;
        gyy = 0;
        break;
      }
      case "1": {
        x = canvas.width - gradientSize;
        y = gradientSize;
        h = canvas.height - 2 * gradientSize;
        w = gradientSize;
        gx = canvas.width - gradientSize;
        gy = 0;
        gxx = canvas.width;
        gyy = 0;
        break;
      }
      case "2": {
        x = gradientSize;
        y = canvas.height - gradientSize;
        w = canvas.width - 2 * gradientSize;
        h = gradientSize;
        gx = 0;
        gy = canvas.height - gradientSize;
        gxx = 0;
        gyy = canvas.height;
        break;
      }
      case "3": {
        x = 0;
        y = gradientSize;
        w = gradientSize;
        h = canvas.height - 2 * gradientSize;
        gx = gradientSize;
        gy = 0;
        gxx = 0;
        gyy = 0;
        break;
      }
      default:
        break;
    }
    const gradient = context.createLinearGradient(gx!, gy!, gxx!, gyy!);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    context.fillStyle = gradient;
    context.fillRect(x!, y!, w!, h!);
  }
};

interface Props {
  ref?: RefObject<HTMLCanvasElement | null>;
}

export const CanvasFade = ({ ref }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref?.current && canvasRef.current) {
      const parent = ref.current;
      const fade = canvasRef.current;
      const context = fade.getContext("2d")!;
      fade.style.position = "absolute";
      fade.style.zIndex = "1";
      const sync = () => {
        trackParentSize(fade, parent);
        drawFade(fade, context);
      };
      // A ResizeObserver on the scene canvas fires whenever its layout size
      // actually changes — including the initial post-mount sizing by the
      // renderer/cinematicResize, which happens AFTER this child effect runs.
      // Window events can't cover that, and their firing order relative to
      // the parent's own resize handlers is not guaranteed.
      const observer = new ResizeObserver(sync);
      observer.observe(parent);
      return () => observer.disconnect();
    }
  }, [ref]);
  return <canvas ref={canvasRef} className="canvas-fade"></canvas>;
};
