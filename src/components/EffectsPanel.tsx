import { useContext, useRef, useState, useEffect } from "react";
import { lerp } from "../utils/mathUtils";
import { chooseNewValue } from "./effectWalk";

import { WebAudioContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";

import { useMusicPlayerStore } from "../stores/musicPlayerStore";

import { Slider } from "./Slider";

import {
  effectsPanel,
  primarySliderLabel,
  moreFxToggle,
  moreFxCaret,
  moreFxCaretOpen,
  moreFxCluster,
  toggleCluster,
  sliderRow,
  switchControl,
  switchTrack,
  switchFill,
  switchKnob,
  switchRow,
  switchLabel,
} from "../styles/components/EffectsPanel.css";
import { flexPanel } from "../styles/shared/layout.css";
import {
  pillButton,
  pillButtonActive,
  pillButtonEven,
  pillRow,
} from "../styles/shared/buttons.css";
import { cx } from "../utils/cx";

// Effect random-walk timing (beats). The interval is both the spacing between new
// targets and the transition length, so Energy scales the modulation: calm = slow
// and sweeping, lively = quicker. The tick is the lerp update granularity.
const CALM_EFFECT_BEATS = 128;
const LIVELY_EFFECT_BEATS = 32;
const EFFECT_TICK_BEATS = 0.25;

// Background-mode safe zone for the effect walk so it can never bury the song:
// the highpass stays <= ~1 kHz (value 72) and the lowpass >= ~3 kHz (value 55).
// Manual sliders are unconstrained — only the auto-walk is penned.
const HP_WALK_CEIL = 72;
const LP_WALK_FLOOR = 55;

// Manual Time Warp glide: the rate eases to its target over GLIDE_STEPS
// segments of GLIDE_STEP_S each. Each step ramps the audio linearly across the
// segment while the clock holds a matching piecewise-constant rate (see
// WebAudioWrapper.setTimeWarpRate); a final settle tick pins both to the exact
// target.
const GLIDE_STEPS = 20;
const GLIDE_STEP_S = 0.03;

interface Preset {
  timeWarp: number;
  energy: number;
  ambience: number;
}

// Slider positions (1-100), as a spectrum from present to deeply calm:
// Work = steady focus bed; Ambient = dreamy and slow; Sleep = slowest and sparsest.
const PRESETS: Record<"work" | "ambient" | "sleep", Preset> = {
  work: { timeWarp: 1, energy: 50, ambience: 10 },
  ambient: { timeWarp: 40, energy: 25, ambience: 45 },
  sleep: { timeWarp: 85, energy: 8, ambience: 70 },
};

type PresetName = keyof typeof PRESETS;

export const EffectsPanel = () => {
  const setVoicesBackgroundMode = useMusicPlayerStore(
    (s) => s.setBackgroundMode,
  );
  const setPauseVisuals = useMusicPlayerStore((s) => s.setPauseVisuals);
  const setTimeWarp = useMusicPlayerStore((s) => s.setTimeWarp);
  const setEnergy = useMusicPlayerStore((s) => s.setEnergy);
  const voicesOn = useMusicPlayerStore((s) => s.backgroundMode);
  const { bpm, id } = useContext(SongContext)!;
  const { WAW } = useContext(WebAudioContext)!;

  const [backgroundMode, setBackgroundMode] = useState(false);
  const backgroundModeEventRef = useRef<number | null>(null);
  const [showMoreFx, setShowMoreFx] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetName | null>(null);

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
    const energy = (energyValue - 1) / 99;
    const intervalSeconds =
      (lerp(CALM_EFFECT_BEATS, LIVELY_EFFECT_BEATS, energy) * 60) / bpm;
    if (
      !effectsTargets.current.time ||
      effectsTargets.current.time < WAW.audioCtx.currentTime - intervalSeconds
    ) {
      // set new targets
      effectsTargets.current.time = WAW.audioCtx.currentTime;
      effectsTargets.current.hp = chooseNewValue(hpValue, 1, HP_WALK_CEIL);
      effectsTargets.current.lp = chooseNewValue(lpValue, LP_WALK_FLOOR, 100);
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
        (EFFECT_TICK_BEATS * 60) / bpm,
        triggerRandomEffects,
      );
      // update event
    } else if (backgroundMode) {
      WAW.scheduler.updateCallback(
        backgroundModeEventRef.current!,
        triggerRandomEffects,
      );
      // stop event
    } else {
      WAW.scheduler.cancel(backgroundModeEventRef.current!);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [bpm, backgroundMode, triggerRandomEffects]);

  /* Glide Cleanup Hook */
  // kill an in-flight glide when the song changes or the panel unmounts, so the
  // interval can't keep firing against a stale song id
  useEffect(() => {
    return () => {
      if (timeWarpGlideRef.current) {
        window.clearInterval(timeWarpGlideRef.current);
        timeWarpGlideRef.current = null;
      }
    };
  }, [id]);

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
    let i = 0;
    if (timeWarpGlideRef.current)
      window.clearInterval(timeWarpGlideRef.current);
    timeWarpGlideRef.current = window.setInterval(() => {
      i++;
      if (i <= GLIDE_STEPS) {
        const r = startRate + (targetRate - startRate) * (i / GLIDE_STEPS);
        WAW.setTimeWarpRate(id, r, GLIDE_STEP_S);
      } else {
        // settle: the last ramp segment has landed; pin clock and audio to the
        // exact target rate
        WAW.setTimeWarpRate(id, targetRate);
        window.clearInterval(timeWarpGlideRef.current!);
        timeWarpGlideRef.current = null;
      }
    }, GLIDE_STEP_S * 1000);
  };

  const handleEnergy = (v: number) => {
    setEnergyValue(v);
    setEnergy((v - 1) / 99);
  };

  const applyPreset = (name: PresetName) => {
    const p = PRESETS[name];
    handleTimeWarp(p.timeWarp);
    handleEnergy(p.energy);
    setAmValue(p.ambience);
    WAW.setEffects("am", p.ambience);
    setVoicesBackgroundMode(true);
    setBackgroundMode(true);
    setActivePreset(name);
  };

  // A preset stays lit while the panel still reflects it, so touching a control
  // that defines it — either headline slider or either background-mode switch —
  // drops the selection. More FX is exempt: the walk is already moving those
  // three values, so a hand nudge among them reads as the preset running rather
  // than a departure from it.
  const clearPreset = () => setActivePreset(null);

  return (
    <div id="effects-panel" className={cx(flexPanel, effectsPanel)}>
      <h2>Background Mode</h2>
      <p>
        Automatically varies the music over time. Ideal for extended listening.
      </p>

      <div className={pillRow}>
        <button
          className={cx(
            pillButton,
            pillButtonEven,
            activePreset === "work" && pillButtonActive,
          )}
          id="preset-work"
          aria-pressed={activePreset === "work"}
          onClick={() => applyPreset("work")}
        >
          Work
        </button>
        <button
          className={cx(
            pillButton,
            pillButtonEven,
            activePreset === "ambient" && pillButtonActive,
          )}
          id="preset-ambient"
          aria-pressed={activePreset === "ambient"}
          onClick={() => applyPreset("ambient")}
        >
          Ambient
        </button>
        <button
          className={cx(
            pillButton,
            pillButtonEven,
            activePreset === "sleep" && pillButtonActive,
          )}
          id="preset-sleep"
          aria-pressed={activePreset === "sleep"}
          onClick={() => applyPreset("sleep")}
        >
          Sleep
        </button>
      </div>

      <div className={toggleCluster}>
        <label className={cx("flex-row", sliderRow, switchRow)}>
          <span className={switchControl}>
            <input
              type="checkbox"
              checked={voicesOn}
              onChange={(e) => {
                clearPreset();
                setVoicesBackgroundMode(e.target.checked);
              }}
            />
            <span className={switchTrack} data-testid="switch">
              <span className={switchFill} />
              <span className={switchKnob} />
            </span>
          </span>
          <span className={switchLabel}>Voices</span>
        </label>
        <label className={cx("flex-row", sliderRow, switchRow)}>
          <span className={switchControl}>
            <input
              type="checkbox"
              checked={backgroundMode}
              onChange={(e) => {
                clearPreset();
                setBackgroundMode(e.target.checked);
              }}
            />
            <span className={switchTrack} data-testid="switch">
              <span className={switchFill} />
              <span className={switchKnob} />
            </span>
          </span>
          <span className={switchLabel}>Effects</span>
        </label>

        <label className={cx("flex-row", sliderRow, switchRow)}>
          <span className={switchControl}>
            <input
              type="checkbox"
              onInput={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setPauseVisuals(checked);
              }}
            />
            <span className={switchTrack} data-testid="switch">
              <span className={switchFill} />
              <span className={switchKnob} />
            </span>
          </span>
          <span className={switchLabel}>Pause Visuals</span>
        </label>
      </div>

      <div className="flex-row">
        <h3 className={primarySliderLabel}>time warp</h3>
      </div>
      <div className="flex-row">
        <Slider
          id="time-warp"
          label="time warp"
          value={timeWarpValue}
          handleValue={(v) => {
            clearPreset();
            handleTimeWarp(v);
          }}
        />
      </div>
      <div className="flex-row">
        <h3 className={primarySliderLabel}>energy</h3>
      </div>
      <div className="flex-row">
        <Slider
          id="energy"
          label="energy"
          value={energyValue}
          handleValue={(v) => {
            clearPreset();
            handleEnergy(v);
          }}
        />
      </div>

      <div className="flex-row">
        <button
          className={moreFxToggle}
          id="more-fx-toggle"
          aria-expanded={showMoreFx}
          onClick={() => setShowMoreFx(!showMoreFx)}
        >
          <span className={cx(moreFxCaret, showMoreFx && moreFxCaretOpen)}>
            ▸
          </span>
          More FX
        </button>
      </div>
      {showMoreFx && (
        <div className={cx(toggleCluster, moreFxCluster)}>
          <div className="flex-row">
            <h3 className={primarySliderLabel}>highpass filter</h3>
          </div>
          <div className="flex-row">
            <Slider
              id="hp-filter"
              label="highpass filter"
              compact
              value={hpValue}
              handleValue={(v) => setHpValue(v)}
            />
          </div>
          <div className="flex-row">
            <h3 className={primarySliderLabel}>lowpass filter</h3>
          </div>
          <div className="flex-row">
            <Slider
              id="lp-filter"
              label="lowpass filter"
              compact
              value={lpValue}
              handleValue={(v) => setLpValue(v)}
              reverse={true}
            />
          </div>
          <div className="flex-row">
            <h3 className={primarySliderLabel}>ambience</h3>
          </div>
          <div className="flex-row">
            <Slider
              id="ambience"
              label="ambience"
              compact
              handleValue={(v) => setAmValue(v)}
              value={amValue}
            />
          </div>
        </div>
      )}
      <div className={pillRow}>
        <button
          className={cx(pillButton, pillButtonEven)}
          id="effects-panel-reset"
          onClick={() => {
            clearPreset();
            setVoicesBackgroundMode(false);
            setBackgroundMode(false);
            handleTimeWarp(1);
            handleEnergy(50);
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
          className={cx(pillButton, pillButtonEven)}
          id="effects-panel-randomize"
          onClick={() => {
            clearPreset();
            setVoicesBackgroundMode(false);
            setBackgroundMode(false);
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
    </div>
  );
};
