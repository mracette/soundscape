import React from "react";

export const useOutsideClick = (nodeRef, insideCallback, outsideCallback) => {
  const handleOutsideClick = React.useCallback(
    (e) => {
      if (nodeRef.current.contains(e.target)) {
        // the click was inside of the nodeRef hierarchy
        insideCallback && insideCallback();
      } else {
        // the click was outside of the nodeRef hierarchy
        outsideCallback && outsideCallback();
      }
    },
    [insideCallback, outsideCallback, nodeRef]
  );

  React.useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);
};
