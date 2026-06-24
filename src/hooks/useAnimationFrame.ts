import { useRef, useEffect } from "react";

type FrameInfo = { delta: number; time: number };

/**
 * Drives a `requestAnimationFrame` loop for the lifetime of the component.
 * Skips the first frame so `delta` is always a real elapsed milliseconds value
 * (not the difference from an undefined previous timestamp). The RAF handle is
 * cancelled via `cancelAnimationFrame` on unmount, so the loop stops cleanly
 * even if the component is removed mid-frame.
 *
 * @param render - called every frame with `{ delta, time }` in milliseconds;
 *   must be stable (memoised) or the loop restarts on every render.
 */
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
