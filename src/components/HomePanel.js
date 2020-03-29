// libs
import React from "react";
import { Link } from "react-router-dom";

// styles
import "../styles/components/MenuButtonContentWrapper.scss";

export const HomePanel = (props) => {
  return (
    <div id="home-panel" className="flex-panel">
      <h2>Return Home?</h2>
      <p>This will stop your current session.</p>
      <div className="flex-row">
        <Link to="/">
          <button
            style={{ width: "20rem" }}
            className="grouped-buttons button-white"
          >
            Proceed
          </button>
        </Link>
      </div>
    </div>
  );
};
