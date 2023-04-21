import { AppWrap } from "./AppWrap";
import { WebGLUnavailable } from "./WebGLUnavailable";

import { WEBGL } from "three108/examples/jsm/WebGL";

import "../styles/app.scss";

export const App = () => {
  if (WEBGL.isWebGLAvailable()) {
    return (
      <div id="app-container" className="fullscreen">
        <AppWrap />
      </div>
    );
  } else {
    return <WebGLUnavailable />;
  }
};
