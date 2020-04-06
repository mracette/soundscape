// libs
import React from "react";
// import anime from 'animejs';

// context
import { MusicPlayerContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";

// styles
import "../styles/components/EffectsPanel.scss";

export const EffectsPanel = (props) => {
  const { dispatch, randomizeEffects } = React.useContext(MusicPlayerContext);
  const { WAW } = React.useContext(WebAudioContext);

  const hpRef = React.useRef();
  const lpRef = React.useRef();
  const ambienceRef = React.useRef();

  return (
    <div id="effects-panel" className="flex-panel">
      <h2>Background Mode</h2>
      <p>
        Automatically varies the music over time. Ideal for extended listening.
      </p>

      <div className="flex-row slider-row">
        <div className="flex-col" style={{ justifyContent: "flex-end" }}>
          <label className="switch">
            <input
              type="checkbox"
              onInput={(e) => {
                const checked = e.target.checked;
                dispatch({ type: "setBackgroundMode", payload: checked });
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="flex-col">
          <span>
            <h3 style={{ marginLeft: "1rem" }}>Voices</h3>
          </span>
        </div>
      </div>
      {/* <div className='flex-row slider-row'>
                <div className='flex-col'>
                    <label className="switch">
                        <input type="checkbox" onInput={(e) => {
                            const checked = e.target.checked;
                            setEffectsBackgroundMode(checked);
                        }} />
                        <span className="slider round"></span>
                    </label>
                </div>
                <div className='flex-col'>
                    <span><h3 style={{ marginLeft: '1rem' }}>Effects</h3></span>
                </div>
            </div> */}

      <h2 id="effects-controls-row">Visuals</h2>
      <p>Change visual settings to improve performance and save power.</p>

      <div className="flex-row slider-row">
        <div className="flex-col" style={{ justifyContent: "flex-end" }}>
          <label className="switch">
            <input
              type="checkbox"
              onInput={(e) => {
                const checked = e.target.checked;
                dispatch({ type: "setPauseVisuals", payload: checked });
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="flex-col">
          <span>
            <h3 style={{ marginLeft: "1rem" }}>Pause Visuals</h3>
          </span>
        </div>
      </div>

      <div
        id="effects-controls-row"
        className="flex-row"
        style={{ justifyContent: "space-between" }}
      >
        <div className="flex-col">
          <h2>Effects</h2>
        </div>
        <div className="flex-col">
          {/* {effectsBackgroundMode && (
            <p className="hot-green">background mode: on</p>
          )} */}
        </div>
      </div>

      <div className="flex-row">
        <button
          className="button-white grouped-buttons"
          id="effects-panel-reset"
          onClick={() => {
            hpRef.current.value = 1;
            lpRef.current.value = 100;
            ambienceRef.current.value = 1;
            WAW.setEffects("hp", 1);
            WAW.setEffects("lp", 100);
            WAW.setEffects("am", 1);
          }}
        >
          Reset
        </button>

        <button
          className="button-white grouped-buttons"
          id="effects-panel-randomize"
          onClick={() => {
            const h = 1 + 99 * Math.random();
            const l = 1 + 99 * Math.random();
            const a = 1 + 99 * Math.random();
            hpRef.current.value = h;
            lpRef.current.value = l;
            ambienceRef.current.value = a;
            WAW.setEffects("hp", h);
            WAW.setEffects("lp", l);
            WAW.setEffects("am", a);
          }}
        >
          Randomize
        </button>
      </div>

      <div className="flex-row">
        <h3 className="slider-label">highpass filter</h3>
      </div>
      <div className="flex-row">
        <input
          type="range"
          min="1"
          max="100"
          defaultValue={1}
          disabled={randomizeEffects}
          id="hp-slider"
          ref={hpRef}
          onInput={(e) => {
            WAW.setEffects("hp", parseInt(e.target.value));
          }}
        ></input>
      </div>
      <div className="flex-row">
        <h3 className="slider-label">lowpass filter</h3>
      </div>
      <div className="flex-row">
        <input
          type="range"
          min="1"
          max="100"
          defaultValue={100}
          disabled={randomizeEffects}
          id="lp-slider"
          ref={lpRef}
          onInput={(e) => {
            WAW.setEffects("lp", parseInt(e.target.value));
          }}
        ></input>
      </div>
      <div className="flex-row">
        <h3 className="slider-label">ambience</h3>
      </div>
      <div className="flex-row">
        <input
          type="range"
          min="1"
          max="100"
          defaultValue={1}
          disabled={randomizeEffects}
          id="spaciousness-slider"
          ref={ambienceRef}
          onInput={(e) => {
            WAW.setEffects("am", parseInt(e.target.value));
          }}
        ></input>
      </div>
    </div>
  );
};
