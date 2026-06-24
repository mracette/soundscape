import { useCallback, useEffect, RefObject } from "react";

export const useOutsideClick = (
  nodeRef: RefObject<HTMLElement | null>,
  insideCallback?: () => void,
  outsideCallback?: () => void
) => {
  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (nodeRef.current!.contains(e.target as Node)) {
        // the click was inside of the nodeRef hierarchy
        insideCallback && insideCallback();
      } else {
        // the click was outside of the nodeRef hierarchy
        outsideCallback && outsideCallback();
      }
    },
    [insideCallback, outsideCallback, nodeRef]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);
};
