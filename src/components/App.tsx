// components
import { AppWrap } from "./AppWrap";
import { WebGLUnavailable } from "./WebGLUnavailable";

// other
import { WEBGL } from "three/examples/jsm/WebGL";

// styles
import "../styles/app.css";

export const App = () => {
  // check if webgl is available, if not, show the error page
  if (WEBGL.isWebGLAvailable()) {
    // return the application JSX
    return (
      <div id="app-container" className="fullscreen">
        <AppWrap />
      </div>
    );
  } else {
    return <WebGLUnavailable />;
  }
};
