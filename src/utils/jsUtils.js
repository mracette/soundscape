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

export const cinematicResize = (canvas) => {
  const DPR = window.devicePixelRatio || 1;

  const ratioTargets = [
    {
      minWidth: 1920,
      ratio: { x: 1920, y: 1080 },
    },
    // {
    //     minWidth: 1080,
    //     ratio: { x: 1920, y: 720 }
    // }
  ];

  const resizeCanvas = () => {
    const screen = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    let counter = 0;
    let target = ratioTargets[counter];

    while (target.minWidth <= screen.w && counter < ratioTargets.length - 1) {
      counter++;
      target = ratioTargets[counter];
    }

    const resizeRatio = Math.min(
      screen.w / target.ratio.x,
      screen.h / target.ratio.y
    );
    canvas.style.width = target.ratio.x * resizeRatio + "px";
    canvas.style.height = target.ratio.y * resizeRatio + "px";
    canvas.width = target.ratio.x * resizeRatio * DPR;
    canvas.height = target.ratio.y * resizeRatio * DPR;
  };

  addWindowListeners(resizeCanvas);
  return () => removeWindowListeners(resizeCanvas);
};
