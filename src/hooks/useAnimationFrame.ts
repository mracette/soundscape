import { useRef, useEffect } from "react";

type FrameInfo = { delta: number; time: number };

export const useAnimationFrame = (render: (info: FrameInfo) => void) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const delta = time - previousTimeRef.current;
        render({ delta, time });
      }
      previousTimeRef.current = time;
      requestRef.current = window.requestAnimationFrame(animate);
    };

    requestRef.current = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(requestRef.current!);
  }, [render]);
};
