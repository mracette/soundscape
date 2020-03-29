// libs
import React from "react";
// import anime from 'animejs';

// context
import { MusicPlayerContext } from "../contexts/contexts";

// styles
import "../styles/components/EffectsPanel.scss";

export const EffectsPanel = (props) => {
  const hpRef = React.useRef();
  const lpRef = React.useRef();
  const ambienceRef = React.useRef();
  const effectsBackgroundModeEventRef = React.useRef();

  const {
    audioCtx,
    dispatch,
    randomizeEffects,
    scheduler,
    highpass,
    lowpass,
    ambience,
  } = React.useContext(MusicPlayerContext);

  const [effectsBackgroundMode, setEffectsBackgroundMode] = React.useState(
    false
  );

  const handleReset = React.useCallback(() => {
    // reset hp
    hpRef.current.value = 1;
    dispatch({ type: "setHighpass", payload: { value: 1 } });

    // reset lp
    lpRef.current.value = 100;
    dispatch({ type: "setLowpass", payload: { value: 100 } });

    // reset spaciousness
    ambienceRef.current.value = 1;
    dispatch({ type: "setAmbience", payload: { value: 1 } });
  }, [dispatch]);

  React.useEffect(() => handleReset(), [handleReset]);

  /* Background Mode Callback */
  const triggerRandomEffects = React.useCallback(() => {
    let h, l, a;

    if (highpass < 25) {
      h = Math.random() * 2;
    } else if (highpass > 75) {
      h = Math.random() * -2;
    } else {
      h = -1 + Math.random() * 2;
    }

    if (lowpass < 25) {
      l = Math.random() * 2;
    } else if (lowpass > 75) {
      l = Math.random() * -2;
    } else {
      l = -1 + Math.random() * 2;
    }

    if (ambience < 25) {
      a = Math.random() * 2;
    } else if (ambience > 75) {
      a = Math.random() * -2;
    } else {
      a = -1 + Math.random() * 2;
    }

    dispatch({ type: "setHighpass", payload: { value: highpass + h } });
    dispatch({ type: "setLowpass", payload: { value: lowpass + l } });
    dispatch({ type: "setAmbience", payload: { value: ambience + a } });

    hpRef.current.value = highpass + h;
    lpRef.current.value = lowpass + h;
    ambienceRef.current.value = ambience + h;
  }, [dispatch, highpass, lowpass, ambience]);

  /* Background Mode Hook */
  React.useEffect(() => {
    // init event
    if (
      effectsBackgroundMode &&
      !scheduler.repeatingQueue.find(
        (e) => e.id === effectsBackgroundModeEventRef.current
      )
    ) {
      effectsBackgroundModeEventRef.current = scheduler.scheduleRepeating(
        audioCtx.currentTime + 0.5,
        1,
        triggerRandomEffects
      );
      // update event
    } else if (effectsBackgroundMode) {
      scheduler.updateCallback(
        effectsBackgroundModeEventRef.current,
        triggerRandomEffects
      );
      // stop event
    } else if (!effectsBackgroundMode) {
      scheduler.cancel(effectsBackgroundModeEventRef.current);
    }
  }, [effectsBackgroundMode, scheduler, audioCtx, triggerRandomEffects]);

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
          {effectsBackgroundMode && (
            <p className="hot-green">background mode: on</p>
          )}
        </div>
      </div>

      <div className="flex-row">
        <button
          className="button-white grouped-buttons"
          id="effects-panel-reset"
          onClick={() => handleReset()}
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

            dispatch({ type: "setHighpass", payload: { value: h } });
            dispatch({ type: "setLowpass", payload: { value: l } });
            dispatch({ type: "setAmbience", payload: { value: a } });

            hpRef.current.value = h;
            lpRef.current.value = l;
            ambienceRef.current.value = a;
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
          disabled={randomizeEffects}
          id="hp-slider"
          ref={hpRef}
          onInput={(e) => {
            dispatch({
              type: "setHighpass",
              payload: { value: parseInt(e.target.value) },
            });
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
          disabled={randomizeEffects}
          id="lp-slider"
          ref={lpRef}
          onInput={(e) => {
            dispatch({
              type: "setLowpass",
              payload: { value: parseInt(e.target.value) },
            });
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
          disabled={randomizeEffects}
          id="spaciousness-slider"
          ref={ambienceRef}
          onInput={(e) => {
            dispatch({
              type: "setAmbience",
              payload: { value: parseInt(e.target.value) },
            });
          }}
        ></input>
      </div>
    </div>
  );
};
