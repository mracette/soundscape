import { useRef, useContext, useEffect, useMemo } from "react";
import { CanvasCoordinates } from "../../utils/mathUtils";

// components
import { Canvas } from "../canvas/Canvas";

// styles
import "../../styles/components/LandingPage.css";

import { LayoutContext } from "../../contexts/contexts";

const speed = 0.001;

interface Props {
  id: string;
  name?: string;
  animate: (ctx: CanvasRenderingContext2D, cycle: number, coords: CanvasCoordinates) => void;
  listen?: boolean;
  isNew?: boolean;
  dispatch?: (action: { type: string | null }) => void;
  setCustomStyles?: (ctx: CanvasRenderingContext2D) => void;
}

export function CustomSongIcon(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const cycleRef = useRef(0);
  const timeRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);
  const coordsRef = useRef<CanvasCoordinates | undefined>(undefined);

  const { animate, id, listen, setCustomStyles, dispatch, isNew } = props;

  const { isMobile } = useContext(LayoutContext)!;

  useEffect(() => {
    const updateCanvas = (time: number, loop: boolean, reset?: boolean) => {
      const delta = reset ? 0 : time - timeRef.current;
      cycleRef.current += delta * speed;
      timeRef.current = time;

      contextRef.current!.clearRect(
        coordsRef.current!.nx(-1),
        coordsRef.current!.ny(-1)!,
        coordsRef.current!.getWidth(),
        coordsRef.current!.getHeight()!
      );

      animate(contextRef.current!, cycleRef.current, coordsRef.current!);

      if (loop) {
        animationRef.current = window.requestAnimationFrame((time) =>
          updateCanvas(time, true)
        );
      }
    };

    const handleSetSelected = () => dispatch!({ type: props.name ?? null });
    const handleUnsetSelected = () => dispatch!({ type: null });

    const setStyles = () => {
      contextRef.current!.lineWidth = coordsRef.current!.getWidth() / 128;
      contextRef.current!.strokeStyle = "#ffffff";
      contextRef.current!.fillStyle = "#ffffff";
      setCustomStyles && setCustomStyles(contextRef.current!);
    };

    const beginAnimation = () => {
      setStyles();
      animationRef.current = window.requestAnimationFrame((time) =>
        updateCanvas(time, true, true)
      );
    };

    const stopAnimation = () => {
      window.cancelAnimationFrame(animationRef.current!);
    };

    if (listen) {
      // add listeners
      canvasRef.current!.addEventListener("touchstart", beginAnimation);
      canvasRef.current!.addEventListener("touchstart", handleSetSelected);
      canvasRef.current!.addEventListener("touchstart", stopAnimation);
      canvasRef.current!.addEventListener("touchstart", handleUnsetSelected);

      canvasRef.current!.addEventListener("mouseover", beginAnimation);
      canvasRef.current!.addEventListener("mouseover", handleSetSelected);
      canvasRef.current!.addEventListener("mouseout", stopAnimation);
      canvasRef.current!.addEventListener("mouseout", handleUnsetSelected);
    }

    // set up canvas/coords and initialize drawing
    coordsRef.current = new CanvasCoordinates({
      canvas: canvasRef.current,
      padding: 0.02,
    });
    contextRef.current = canvasRef.current!.getContext("2d");
    setStyles();
    updateCanvas(0, false, false);

    if (!listen) {
      beginAnimation();
    }

    // cleanup
    // LATENT BUG: canvasRef.current may be null after unmount; preserved as-is
    return () => {
      stopAnimation();
      if (listen) {
        canvasRef.current!.removeEventListener("touchstart", beginAnimation);
        canvasRef.current!.removeEventListener("touchstart", handleSetSelected);
        canvasRef.current!.removeEventListener("touchstart", stopAnimation);
        canvasRef.current!.removeEventListener(
          "touchstart",
          handleUnsetSelected
        );

        canvasRef.current!.removeEventListener("mouseover", beginAnimation);
        canvasRef.current!.removeEventListener("mouseover", handleSetSelected);
        canvasRef.current!.removeEventListener("mouseout", stopAnimation);
        canvasRef.current!.removeEventListener("mouseout", handleUnsetSelected);
      }
    };
  }, [dispatch, props.name, animate, listen, setCustomStyles]);

  return useMemo(() => {
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
          className={isMobile ? "custom-song-icon-mobile" : "custom-song-icon"}
          onLoad={(canvas) => (canvasRef.current = canvas)}
          resize={false}
        />
      </div>
    );
  }, [id, isNew, isMobile]);
}
