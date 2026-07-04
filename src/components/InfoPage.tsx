import { Link } from "wouter";
import { infoSubheader, infoRow, infoPageButton } from "../styles/components/LandingPage.css";
import { pillButton } from "../styles/shared/buttons.css";
import { cx } from "../utils/cx";
import { isWeb } from "../utils/runtime";

export function InfoPage() {
  return (
    <div className="flex-col" style={{ alignItems: "center" }}>
      {!isWeb && (
        <Link href="/">
          <button className={cx(infoPageButton, pillButton)}>← Back</button>
        </Link>
      )}
      <h3 className={cx(infoSubheader, "info-subheader")}>
        The immersive music visualizer that lets you build your own beats
      </h3>
      <div className={infoRow}>
        <p>Join the Discord for updates on new content</p>
        <a
          href="https://discord.gg/7u7e4ZbeQk"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx(infoPageButton, pillButton)}>
            Join the Discord
          </button>
        </a>
      </div>
      <div className={infoRow}>
        <p>View the source code for Soundscape</p>
        <a
          href="https://github.com/mracette/soundscape"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx(infoPageButton, pillButton)}>
            View the source
          </button>
        </a>
      </div>
      <div className={infoRow}>
        <p>Questions or comments?</p>
        <a
          href="mailto:markracette+soundscape@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx(infoPageButton, pillButton)}>
            Send an email
          </button>
        </a>
      </div>
    </div>
  );
}
