export const addWindowListeners = (callback) => {
  window.addEventListener("resize", callback);
  window.addEventListener("orientationchange", callback);
  window.addEventListener("fullscreenchange", callback);
  window.visualViewport &&
    window.visualViewport.addEventListener("scroll", callback);
  window.visualViewport &&
    window.visualViewport.addEventListener("resize", callback);
};

export const removeWindowListeners = (callback) => {
  window.removeEventListener("resize", callback);
  window.removeEventListener("orientationchange", callback);
  window.removeEventListener("fullscreenchange", callback);
  window.visualViewport &&
    window.visualViewport.removeEventListener("scroll", callback);
  window.visualViewport &&
    window.visualViewport.removeEventListener("resize", callback);
};

export const cinematicResize = (element) => {
  return () => {
    const resizeElement = element;
    const ratioTargets = [
      {
        minRatio: 1,
        ratio: { x: 1920, y: 1080 },
      },
      {
        minRatio: 0,
        ratio: { x: 1920, y: 1920 },
      },
    ];

    const screen = {
      w: window.innerWidth,
      h: window.innerHeight,
      r: window.innerWidth / window.innerHeight,
    };

    let target;

    if (screen.r > 1) {
      target = ratioTargets[0];
    } else {
      target = ratioTargets[1];
    }

    const resizeRatio = Math.min(
      screen.w / target.ratio.x,
      screen.h / target.ratio.y
    );

    resizeElement.style.width = target.ratio.x * resizeRatio + "px";
    resizeElement.style.height = target.ratio.y * resizeRatio + "px";
  };
};
