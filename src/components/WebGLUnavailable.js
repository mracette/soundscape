import React from "react";

export const WebGLUnavailable = () => {
  const unsupportedType = window.WebGLRenderingContext
    ? "graphics card"
    : "browser";

  return (
    <div>
      <p>
        Your {unsupportedType} does not seem to support{" "}
        <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">
          WebGL
        </a>
        .
      </p>
      <p>
        In order to access this application, you will need to use a supported
        device.
      </p>
    </div>
  );
};
