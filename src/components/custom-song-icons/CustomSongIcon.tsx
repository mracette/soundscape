import { useRef, useContext, useEffect, useMemo } from "react";
import { CanvasCoordinates } from "../../utils/mathUtils";

import { Canvas } from "../canvas/Canvas";
import {
  newLabel,
  customSongIcon,
  customSongIconMobile,
} from "../../styles/components/CustomSongIcons.css";

import { LayoutContext } from "../../contexts/contexts";

const speed = 0.001;

interface Props {
  id: string;
  name?: string;
  animate: (
    ctx: CanvasRenderingContext2D,
    cycle: number,
    coords: CanvasCoordinates,
    hoverProgress: number
  ) => void;
  listen?: boolean;
  isNew?: boolean;
  onSelect?: (id: string | null) => void;
  setCustomStyles?: (ctx: CanvasRenderingContext2D) => void;
}

export function CustomSongIcon(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const cycleRef = useRef(0);
  const timeRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);
  const coordsRef = useRef<CanvasCoordinates | undefined>(undefined);
  const hoveredRef = useRef(false);
  const hoverProgressRef = useRef(0);
  const runningRef = useRef(false);

  const { animate, id, listen, setCustomStyles, onSelect, isNew } = props;

  const { isMobile } = useContext(LayoutContext)!;

  useEffect(() => {
    const updateCanvas = (time: number, loop: boolean, reset?: boolean) => {
      // clamp: effect re-runs redraw with time=0, which would otherwise make
      // delta negative and blow the hover fade past 1 (renders as red)
      const delta = reset ? 0 : Math.max(0, time - timeRef.current);
      cycleRef.current += delta * speed;
      timeRef.current = time;

      // hover state applies immediately — no fade in either direction
      hoverProgressRef.current = hoveredRef.current ? 1 : 0;

      contextRef.current!.clearRect(
        coordsRef.current!.nx(-1),
        coordsRef.current!.ny(-1)!,
        coordsRef.current!.getWidth(),
        coordsRef.current!.getHeight()!
      );

      // reset base styles every frame since animate may swap in per-element
      // gradients while hovered
      setStyles();
      animate(contextRef.current!, cycleRef.current, coordsRef.current!, hoverProgressRef.current);

      if (loop) {
        // listening icons freeze the moment the hover ends (after this
        // frame paints them back to white)
        if (!listen || hoveredRef.current || hoverProgressRef.current > 0) {
          animationRef.current = window.requestAnimationFrame((time) =>
            updateCanvas(time, true)
          );
        } else {
          runningRef.current = false;
        }
      }
    };

    const handleSetSelected = () => onSelect?.(props.name ?? null);
    const handleUnsetSelected = () => onSelect?.(null);

    const handleMouseOver = () => {
      hoveredRef.current = true;
    };
    // the running loop fades back to white on its own, then stops
    const handleMouseOut = () => {
      hoveredRef.current = false;
    };

    const setStyles = () => {
      contextRef.current!.lineWidth = coordsRef.current!.getWidth() / 128;
      contextRef.current!.strokeStyle = "#ffffff";
      contextRef.current!.fillStyle = "#ffffff";
      setCustomStyles && setCustomStyles(contextRef.current!);
    };

    const beginAnimation = () => {
      // a re-hover during the fade-out retargets the still-running loop
      if (runningRef.current) return;
      runningRef.current = true;
      animationRef.current = window.requestAnimationFrame((time) =>
        updateCanvas(time, true, true)
      );
    };

    const stopAnimation = () => {
      runningRef.current = false;
      window.cancelAnimationFrame(animationRef.current!);
    };

    // hovering anywhere on the enclosing card link animates the icon, not
    // just the canvas itself
    const hoverTarget = (canvasRef.current!.closest("a") ??
      canvasRef.current!) as HTMLElement;

    if (listen) {
      // add listeners
      hoverTarget.addEventListener("touchstart", beginAnimation);
      hoverTarget.addEventListener("touchstart", handleSetSelected);
      hoverTarget.addEventListener("touchstart", stopAnimation);
      hoverTarget.addEventListener("touchstart", handleUnsetSelected);

      hoverTarget.addEventListener("mouseover", handleMouseOver);
      hoverTarget.addEventListener("mouseover", beginAnimation);
      hoverTarget.addEventListener("mouseover", handleSetSelected);
      hoverTarget.addEventListener("mouseout", handleMouseOut);
      hoverTarget.addEventListener("mouseout", handleUnsetSelected);
    }

    // set up canvas/coords and initialize drawing
    coordsRef.current = new CanvasCoordinates({
      canvas: canvasRef.current,
      padding: 0.02,
    });
    contextRef.current = canvasRef.current!.getContext("2d");
    updateCanvas(0, false, false);

    // resume the loop if this is an effect re-run mid-hover or mid-fade,
    // otherwise the icon freezes on a partial gradient frame
    if (!listen || hoveredRef.current || hoverProgressRef.current > 0) {
      beginAnimation();
    }

    // cleanup
    return () => {
      stopAnimation();
      if (listen) {
        hoverTarget.removeEventListener("touchstart", beginAnimation);
        hoverTarget.removeEventListener("touchstart", handleSetSelected);
        hoverTarget.removeEventListener("touchstart", stopAnimation);
        hoverTarget.removeEventListener("touchstart", handleUnsetSelected);

        hoverTarget.removeEventListener("mouseover", handleMouseOver);
        hoverTarget.removeEventListener("mouseover", beginAnimation);
        hoverTarget.removeEventListener("mouseover", handleSetSelected);
        hoverTarget.removeEventListener("mouseout", handleMouseOut);
        hoverTarget.removeEventListener("mouseout", handleUnsetSelected);
      }
    };
    // isMobile: crossing the breakpoint makes Canvas reset the drawing-buffer
    // size, which wipes the bitmap — re-run to rebuild coords and repaint
  }, [onSelect, props.name, animate, listen, setCustomStyles, isMobile]);

  return useMemo(() => {
    return (
      <div
        style={{
          position: "relative",
          // border: isNew ? "1px solid" : "0px solid",
        }}
      >
        {isNew && <span className={newLabel}>New!</span>}
        <Canvas
          id={id}
          className={isMobile ? customSongIconMobile : customSongIcon}
          onLoad={(canvas) => (canvasRef.current = canvas)}
          resize={false}
        />
      </div>
    );
  }, [id, isNew, isMobile]);
}
