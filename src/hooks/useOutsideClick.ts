import { useCallback, useEffect, RefObject } from "react";

/**
 * Fires `insideCallback` or `outsideCallback` depending on whether a mousedown
 * lands inside or outside the `nodeRef` subtree. Uses `contains()` so clicks on
 * any descendant of the ref are treated as "inside". The listener is attached to
 * `document` and removed on unmount.
 *
 * @param nodeRef - the element that defines the boundary
 * @param insideCallback - called when the click is within the ref subtree
 * @param outsideCallback - called when the click is outside the ref subtree
 */
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
