// libs
import React from "react";

export const useAnimationFrame = (render) => {
  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();

  React.useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        const delta = time - previousTimeRef.current;
        render({ delta, time });
      }
      previousTimeRef.current = time;
      requestRef.current = window.requestAnimationFrame(animate);
    };

    requestRef.current = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(requestRef.current);
  }, [render]);
};
