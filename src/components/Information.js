// libs
import React from "react";
import { Link } from "react-router-dom";

// components
import { SocialIcons } from "./iconography/SocialIcons";

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
          <div className="flex-row">
            <span>Soundscape is constantly changing.</span>
          </div>
          <div className="flex-row">
            <span>
              To stay in the loop, sign up for
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
          <SocialIcons
            divClassList="coming-soon-icon-row"
            svgClassList="icon icon-moon"
          />
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
