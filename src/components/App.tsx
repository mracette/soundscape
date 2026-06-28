import { AppWrap } from "./AppWrap";
import { WebGLUnavailable } from "./WebGLUnavailable";
import { WEBGL } from "three-legacy/examples/jsm/WebGL";
import "../styles/app.css";

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
