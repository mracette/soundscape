// libs
import React from "react";
import { clamp, lerp } from "crco-utils";

// context
import { MusicPlayerContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";

// components
import { CanvasSlider } from "./canvas/CanvasSlider";

// styles
import "../styles/components/EffectsPanel.scss";

const EFFECT_INTERVAL = 4; // in beats

const chooseNewValue = (prev) => {
  const max = 100;
  const bounds = 35;
  const effectSize = 40;
  let newValue;
  if (prev < bounds) {
    newValue = prev + Math.random() * effectSize;
  } else if (prev > max - bounds) {
    newValue = prev - Math.random() * effectSize;
  } else {
    newValue = prev + (-0.5 + Math.random()) * effectSize;
  }
  return clamp(newValue, 1, 100);
};

export const EffectsPanel = (props) => {
  const { dispatch } = React.useContext(MusicPlayerContext);
  const { bpm } = React.useContext(SongContext);
  const { WAW } = React.useContext(WebAudioContext);

  const [backgroundMode, setBackgroundMode] = React.useState(false);
  const backgroundModeEventRef = React.useRef(null);

  const [hpValue, setHpValue] = React.useState(1);
  const [lpValue, setLpValue] = React.useState(100);
  const [amValue, setAmValue] = React.useState(1);

  const effectsTargets = React.useRef({
    time: null,
    hp: null,
    lp: null,
    am: null,
  });

  const triggerRandomEffects = () => {
    const intervalSeconds = (EFFECT_INTERVAL * 60) / bpm;
    if (
      !effectsTargets.current.time ||
      effectsTargets.current.time < WAW.audioCtx.currentTime - intervalSeconds
    ) {
      // set new targets
      effectsTargets.current.time = WAW.audioCtx.currentTime;
      effectsTargets.current.hp = chooseNewValue(hpValue);
      effectsTargets.current.lp = chooseNewValue(lpValue);
      effectsTargets.current.am = chooseNewValue(amValue);
    }
    const progress =
      (WAW.audioCtx.currentTime - effectsTargets.current.time) /
      intervalSeconds;
    const newHp = lerp(hpValue, effectsTargets.current.hp, progress);
    const newLp = lerp(lpValue, effectsTargets.current.lp, progress);
    const newAm = lerp(amValue, effectsTargets.current.am, progress);
    setHpValue(newHp);
    WAW.setEffects("hp", newHp);
    setLpValue(newLp);
    WAW.setEffects("lp", newLp);
    setAmValue(newAm);
    WAW.setEffects("am", newAm);
  };

  /* Background Mode Hook */
  React.useEffect(() => {
    // init event
    if (
      backgroundMode &&
      !WAW.scheduler.getEvent(backgroundModeEventRef.current)
    ) {
      backgroundModeEventRef.current = WAW.scheduler.scheduleRepeating(
        WAW.audioCtx.currentTime + 60 / bpm,
        (EFFECT_INTERVAL * 60) / bpm / 16,
        triggerRandomEffects
      );
      // update event
    } else if (backgroundMode) {
      WAW.scheduler.updateCallback(
        backgroundModeEventRef.current,
        triggerRandomEffects
      );
      // stop event
    } else if (!backgroundMode) {
      WAW.scheduler.cancel(backgroundModeEventRef.current);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [bpm, backgroundMode, triggerRandomEffects]);

  /* Effect Value Hooks */
  React.useEffect(() => {
    WAW.setEffects("hp", hpValue);
  }, [WAW, hpValue]);
  React.useEffect(() => {
    WAW.setEffects("lp", lpValue);
  }, [WAW, lpValue]);
  React.useEffect(() => {
    WAW.setEffects("am", amValue);
  }, [WAW, amValue]);

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
      <div className="flex-row slider-row">
        <div className="flex-col">
          <label className="switch">
            <input
              type="checkbox"
              onInput={(e) => {
                const checked = e.target.checked;
                setBackgroundMode(checked);
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="flex-col">
          <span>
            <h3 style={{ marginLeft: "1rem" }}>Effects</h3>
          </span>
        </div>
      </div>
      <h2 id="effects-controls-row">Visuals</h2>
      <p>Pause visuals to improve performance and save power.</p>

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
          {backgroundMode && <p className="hot-green">background mode: on</p>}
        </div>
      </div>

      <div className="flex-row">
        <button
          className="button-white grouped-buttons"
          id="effects-panel-reset"
          onClick={() => {
            setHpValue(1);
            setLpValue(100);
            setAmValue(1);
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
            setHpValue(h);
            setLpValue(l);
            setAmValue(a);
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
        <CanvasSlider
          id="hp-filter"
          value={hpValue}
          handleValue={(v) => setHpValue(v)}
        />
      </div>
      <div className="flex-row">
        <h3 className="slider-label">lowpass filter</h3>
      </div>
      <div className="flex-row">
        <CanvasSlider
          id="lp-filter"
          value={lpValue}
          handleValue={(v) => setLpValue(v)}
          reverse={true}
        />
      </div>
      <div className="flex-row">
        <h3 className="slider-label">ambience</h3>
      </div>
      <div className="flex-row">
        <CanvasSlider
          id="ambience"
          handleValue={(v) => setAmValue(v)}
          value={amValue}
        />
      </div>
    </div>
  );
};
