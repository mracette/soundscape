import { Link } from "wouter";

import "../styles/components/MenuButtonContentWrapper.css";

export const HomePanel = () => {
  return (
    <div id="home-panel" className="flex-panel">
      <h2>Return Home?</h2>
      <p>This will stop your current session.</p>
      <div className="flex-row">
        <Link href="/">
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
