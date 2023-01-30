// libs
import React from "react";
import { Link } from "react-router-dom";

// styles
import "../styles/components/LandingPage.scss";
import "../styles/components/ComingSoon.scss";

export const Information = () => {
  return (
    <div id="coming-soon" className="fullscreen off-black">
      <div className="landing-page-header">
        <div className="flex-row">
          <h1 id="landing-page-soundscape-title">Soundscape</h1>
        </div>
        <div id="coming-soon-panel" className="flex-col">
          <div className="flex-row row-margin-bottom">
            <span>New content is coming to Soundscape in 2023.</span>
          </div>
          <div className="flex-row row-margin-bottom">
            <a
              href="https://discord.gg/7u7e4ZbeQk"
              target="_blank"
              and
              rel="noopener noreferrer"
            >
              <button className="info-page-button button-yellow">
                Join the Discord to stay in the loop
              </button>
            </a>
          </div>
          <div className="flex-row row-margin">
            <span>
              Or sign up for
              <span className="hot-pink">&nbsp;email updates&nbsp;</span>below.
            </span>
          </div>
          <div id="mc_embed_signup">
            <form
              action="https://world.us4.list-manage.com/subscribe/post?u=4d5488d441c94ac4c98944eb9&amp;id=f3e8462184"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              className="validate"
              target="_blank"
              noValidate
            >
              <div id="mc_embed_signup_scroll" className="flex-row">
                <input
                  type="email"
                  name="EMAIL"
                  className="email custom-mc-input"
                  id="mce-EMAIL"
                  placeholder="email address"
                  required
                />
                <div
                  style={{ position: "absolute", left: "-5000px" }}
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    name="b_4d5488d441c94ac4c98944eb9_f3e8462184"
                    tabIndex="-1"
                    value=""
                    onChange={() => null}
                  />
                </div>
                <div className="clear">
                  <input
                    type="submit"
                    value="Subscribe"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="button info-page-button button-yellow"
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="flex-row row-margin-bottom">
            <span>You can find the source code for Soundscape on&nbsp;</span>
            <a
              href="https://github.com/mracette/soundscape"
              target="_blank"
              and
              rel="noopener noreferrer"
            >
              Github
            </a>
          </div>
        </div>
        <div>
          <Link to="/">
            <button className="info-page-button button-yellow">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
