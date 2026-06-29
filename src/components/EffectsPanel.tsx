import { useContext, useRef, useState, useEffect } from "react";
import { clamp, lerp } from "../utils/mathUtils";

import { WebAudioContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";

import { useMusicPlayerStore } from "../stores/musicPlayerStore";

import { CanvasSlider } from "./canvas/CanvasSlider";

import {
  sliderLabel,
  sliderRow,
  effectsControlsRow,
  switchControl,
  slider,
  round,
} from "../styles/components/EffectsPanel.css";
import { flexPanel } from "../styles/shared/layout.css";
import { buttonWhite, groupedButtons } from "../styles/shared/buttons.css";
import { cx } from "../utils/cx";

const EFFECT_INTERVAL = 4; // in beats

const chooseNewValue = (prev: number): number => {
  const max = 100;
  const bounds = 35;
  const effectSize = 40;
  let newValue: number;
  if (prev < bounds) {
    newValue = prev + Math.random() * effectSize;
  } else if (prev > max - bounds) {
    newValue = prev - Math.random() * effectSize;
  } else {
    newValue = prev + (-0.5 + Math.random()) * effectSize;
  }
  return clamp(newValue, 1, 100);
};

export const EffectsPanel = () => {
  const setVoicesBackgroundMode = useMusicPlayerStore(
    (s) => s.setBackgroundMode
  );
  const setPauseVisuals = useMusicPlayerStore((s) => s.setPauseVisuals);
  const setTimeWarp = useMusicPlayerStore((s) => s.setTimeWarp);
  const setEnergy = useMusicPlayerStore((s) => s.setEnergy);
  const { bpm, id } = useContext(SongContext)!;
  const { WAW } = useContext(WebAudioContext)!;

  const [backgroundMode, setBackgroundMode] = useState(false);
  const backgroundModeEventRef = useRef<number | null>(null);

  const [hpValue, setHpValue] = useState(1);
  const [lpValue, setLpValue] = useState(100);
  const [amValue, setAmValue] = useState(1);
  const [timeWarpValue, setTimeWarpValue] = useState(1);
  const timeWarpGlideRef = useRef<number | null>(null);
  const [energyValue, setEnergyValue] = useState(50);

  const effectsTargets = useRef<{
    time: number | null;
    hp: number | null;
    lp: number | null;
    am: number | null;
  }>({
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
      (WAW.audioCtx.currentTime - effectsTargets.current.time!) /
      intervalSeconds;
    const newHp = lerp(hpValue, effectsTargets.current.hp!, progress);
    const newLp = lerp(lpValue, effectsTargets.current.lp!, progress);
    const newAm = lerp(amValue, effectsTargets.current.am!, progress);
    setHpValue(newHp);
    WAW.setEffects("hp", newHp);
    setLpValue(newLp);
    WAW.setEffects("lp", newLp);
    setAmValue(newAm);
    WAW.setEffects("am", newAm);
  };

  /* Background Mode Hook */
  useEffect(() => {
    // init event
    if (
      backgroundMode &&
      !WAW.scheduler.getEvent(backgroundModeEventRef.current!)
    ) {
      backgroundModeEventRef.current = WAW.scheduler.scheduleRepeating(
        WAW.audioCtx.currentTime + 60 / bpm,
        (EFFECT_INTERVAL * 60) / bpm / 16,
        triggerRandomEffects
      );
      // update event
    } else if (backgroundMode) {
      WAW.scheduler.updateCallback(
        backgroundModeEventRef.current!,
        triggerRandomEffects
      );
      // stop event
    } else {
      WAW.scheduler.cancel(backgroundModeEventRef.current!);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [bpm, backgroundMode, triggerRandomEffects]);

  /* Effect Value Hooks */
  useEffect(() => {
    WAW.setEffects("hp", hpValue);
  }, [WAW, hpValue]);
  useEffect(() => {
    WAW.setEffects("lp", lpValue);
  }, [WAW, lpValue]);
  useEffect(() => {
    WAW.setEffects("am", amValue);
  }, [WAW, amValue]);

  // slider 1..100 -> rate 1.0..0.5 (one octave / half tempo at the floor)
  const timeWarpToRate = (v: number) => 1 - ((v - 1) / 99) * 0.5;

  const handleTimeWarp = (v: number) => {
    setTimeWarpValue(v);
    setTimeWarp((v - 1) / 99);
    const targetRate = timeWarpToRate(v);
    const startRate = WAW.getTempoClock(id).currentRate;
    const steps = 20;
    let i = 0;
    if (timeWarpGlideRef.current) window.clearInterval(timeWarpGlideRef.current);
    timeWarpGlideRef.current = window.setInterval(() => {
      i++;
      const r = startRate + (targetRate - startRate) * (i / steps);
      WAW.setTimeWarpRate(id, r);
      if (i >= steps) {
        window.clearInterval(timeWarpGlideRef.current!);
        timeWarpGlideRef.current = null;
      }
    }, 30);
  };

  const handleEnergy = (v: number) => {
    setEnergyValue(v);
    setEnergy((v - 1) / 99);
  };

  return (
    <div id="effects-panel" className={flexPanel}>
      <h2>Background Mode</h2>
      <p>
        Automatically varies the music over time. Ideal for extended listening.
      </p>

      <div className={cx("flex-row", sliderRow)}>
        <div className="flex-col" style={{ justifyContent: "flex-end" }}>
          <label className={switchControl}>
            <input
              type="checkbox"
              onInput={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setVoicesBackgroundMode(checked);
              }}
            />
            <span className={cx(slider, round, "slider", "round")}></span>
          </label>
        </div>
        <div className="flex-col">
          <span>
            <h3 style={{ marginLeft: "1rem" }}>Voices</h3>
          </span>
        </div>
      </div>
      <div className={cx("flex-row", sliderRow)}>
        <div className="flex-col">
          <label className={switchControl}>
            <input
              type="checkbox"
              onInput={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setBackgroundMode(checked);
              }}
            />
            <span className={cx(slider, round, "slider", "round")}></span>
          </label>
        </div>
        <div className="flex-col">
          <span>
            <h3 style={{ marginLeft: "1rem" }}>Effects</h3>
          </span>
        </div>
      </div>
      <h2 id="effects-controls-row" className={effectsControlsRow}>Visuals</h2>
      <p>Pause visuals to improve performance and save power.</p>

      <div className={cx("flex-row", sliderRow)}>
        <div className="flex-col" style={{ justifyContent: "flex-end" }}>
          <label className={switchControl}>
            <input
              type="checkbox"
              onInput={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setPauseVisuals(checked);
              }}
            />
            <span className={cx(slider, round, "slider", "round")}></span>
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
        className={cx("flex-row", effectsControlsRow)}
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
          className={cx(buttonWhite, groupedButtons)}
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
          className={cx(buttonWhite, groupedButtons)}
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
        <h3 className={sliderLabel}>time warp</h3>
      </div>
      <div className="flex-row">
        <CanvasSlider
          id="time-warp"
          value={timeWarpValue}
          handleValue={handleTimeWarp}
        />
      </div>
      <div className="flex-row">
        <h3 className={sliderLabel}>energy</h3>
      </div>
      <div className="flex-row">
        <CanvasSlider
          id="energy"
          value={energyValue}
          handleValue={handleEnergy}
        />
      </div>
      <div className="flex-row">
        <h3 className={sliderLabel}>highpass filter</h3>
      </div>
      <div className="flex-row">
        <CanvasSlider
          id="hp-filter"
          value={hpValue}
          handleValue={(v) => setHpValue(v)}
        />
      </div>
      <div className="flex-row">
        <h3 className={sliderLabel}>lowpass filter</h3>
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
        <h3 className={sliderLabel}>ambience</h3>
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
