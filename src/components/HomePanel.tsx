import { Link } from "wouter";

import { flexPanel } from "../styles/shared/layout.css";
import { pillButton, pillButtonAccent } from "../styles/shared/buttons.css";
import { cx } from "../utils/cx";

export const HomePanel = () => {
  return (
    <div id="home-panel" className={flexPanel}>
      <h2>Return Home?</h2>
      <p>This will stop your current session.</p>
      <div className="flex-row">
        <Link href="/">
          <button
            style={{ width: "20rem" }}
            className={cx(pillButton, pillButtonAccent.primary)}
          >
            Proceed
          </button>
        </Link>
      </div>
    </div>
  );
};
