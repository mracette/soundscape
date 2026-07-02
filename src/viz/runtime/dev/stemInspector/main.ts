import appConfigJson from "../../../../app-config.json";
import { toMono } from "../../bake/bakeUtils";
import { analyzeStem, DEFAULT_SETTINGS, type BakeSettings, type StemAnalysis } from "./analysis";
import { drawInspector, type CurveToggles } from "./draw";
import { buildSidebarModel, type AppConfigSong, type StemEntry } from "./stemModel";
import { peakColumns } from "./waveform";

declare global {
  interface Window {
    __stemInspector?: { ready: boolean; frames: number; lastError: string | null };
  }
}

const debug = { ready: false, frames: 0, lastError: null as string | null };
window.__stemInspector = debug;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const state = {
  analysis: null as StemAnalysis | null,
  variant: "snappy" as "raw" | "snappy",
  audio: null as AudioBuffer | null,
  samples: null as Float32Array | null,
  peaks: [] as { min: number; max: number }[],
  settings: structuredClone(DEFAULT_SETTINGS) as BakeSettings,
  toggles: { volume: true, onset: true, buckets: [] } as CurveToggles,
  playheadSec: 0,
};

function showError(msg: string): void {
  const el = document.getElementById("error") as HTMLElement;
  el.hidden = false;
  el.textContent = msg;
  debug.lastError = msg;
}
function clearError(): void {
  (document.getElementById("error") as HTMLElement).hidden = true;
  debug.lastError = null;
}

function frames() {
  return state.analysis ? state.analysis[state.variant].frames : [];
}

function redraw(): void {
  drawInspector(canvas, state.peaks, frames(), state.toggles, state.playheadSec, state.audio?.duration ?? 0);
}

function sizeCanvas(): void {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  if (state.samples) state.peaks = peakColumns(state.samples, canvas.width);
  redraw();
}
window.addEventListener("resize", sizeCanvas);

function debounce<A extends unknown[]>(fn: (...a: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...a: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

async function rebake(): Promise<void> {
  if (!state.audio || !state.samples) return;
  state.analysis = await analyzeStem(state.samples, state.audio.sampleRate, state.settings);
  state.toggles.buckets = state.toggles.buckets.slice(0, state.settings.numBuckets);
  while (state.toggles.buckets.length < state.settings.numBuckets) state.toggles.buckets.push(false);
  debug.frames = frames().length;
  renderKnobs();
  redraw();
}
const rebakeDebounced = debounce(() => void rebake().catch((e) => showError(String(e))), 150);

const audioCache = new Map<string, AudioBuffer>();

async function selectStem(stem: StemEntry): Promise<void> {
  clearError();
  const ctx = new AudioContext();
  try {
    if (!audioCache.has(stem.url)) {
      const res = await fetch(stem.url);
      if (!res.ok) throw new Error(`fetch ${stem.url}: HTTP ${res.status}`);
      audioCache.set(stem.url, await ctx.decodeAudioData(await res.arrayBuffer()));
    }
  } finally {
    void ctx.close();
  }
  state.audio = audioCache.get(stem.url)!;
  state.samples = toMono(state.audio);
  state.settings = {
    ...structuredClone(DEFAULT_SETTINGS),
    analyser: { ...structuredClone(DEFAULT_SETTINGS).analyser, ...stem.analyser },
  };
  state.playheadSec = 0;
  state.peaks = peakColumns(state.samples, canvas.width);
  await rebake();
  onStemLoaded(state.audio);
}

/** Task 8 replaces this hook with player wiring. */
let onStemLoaded: (buf: AudioBuffer) => void = () => {};
export function setOnStemLoaded(fn: (buf: AudioBuffer) => void): void {
  onStemLoaded = fn;
}
export function setPlayhead(sec: number): void {
  state.playheadSec = sec;
  redraw();
}
export function currentFrames() {
  return frames();
}
export function currentFps() {
  return state.settings.fps;
}

function numberKnob(label: string, value: number, step: number, onChange: (v: number) => void): HTMLLabelElement {
  const el = document.createElement("label");
  const span = document.createElement("span");
  span.textContent = label;
  const input = document.createElement("input");
  input.type = "number";
  input.step = String(step);
  input.value = String(value);
  input.addEventListener("input", () => {
    const v = Number(input.value);
    if (Number.isFinite(v)) onChange(v);
  });
  el.append(span, input);
  return el;
}

function checkbox(label: string, checked: boolean, onChange: (v: boolean) => void): HTMLLabelElement {
  const el = document.createElement("label");
  const span = document.createElement("span");
  span.textContent = label;
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  el.append(span, input);
  return el;
}

function renderKnobs(): void {
  const knobs = document.getElementById("knobs") as HTMLElement;
  knobs.replaceChildren();
  const s = state.settings;
  const h3 = (t: string) => {
    const e = document.createElement("h3");
    e.textContent = t;
    knobs.appendChild(e);
  };

  h3("variant");
  knobs.appendChild(
    checkbox("snappy bake", state.variant === "snappy", (v) => {
      state.variant = v ? "snappy" : "raw";
      debug.frames = frames().length;
      redraw();
    })
  );

  h3("analyser (mono, as baked)");
  knobs.appendChild(numberKnob("power", s.analyser.power, 1, (v) => ((s.analyser.power = v), rebakeDebounced())));
  knobs.appendChild(
    numberKnob("smoothing", s.analyser.smoothingTimeConstant, 0.05, (v) => ((s.analyser.smoothingTimeConstant = v), rebakeDebounced()))
  );
  knobs.appendChild(
    numberKnob("min freq", s.analyser.minFrequency, 10, (v) => ((s.analyser.minFrequency = v), rebakeDebounced()))
  );
  knobs.appendChild(
    numberKnob("max freq", s.analyser.maxFrequency, 100, (v) => ((s.analyser.maxFrequency = v), rebakeDebounced()))
  );

  h3("bake");
  knobs.appendChild(numberKnob("buckets", s.numBuckets, 1, (v) => ((s.numBuckets = Math.max(1, v)), rebakeDebounced())));
  knobs.appendChild(numberKnob("fps", s.fps, 1, (v) => ((s.fps = Math.max(1, v)), rebakeDebounced())));

  h3("snappy");
  knobs.appendChild(numberKnob("coef", s.snappy.coef, 0.05, (v) => ((s.snappy.coef = v), rebakeDebounced())));
  knobs.appendChild(numberKnob("lead frames", s.snappy.leadFrames, 1, (v) => ((s.snappy.leadFrames = v), rebakeDebounced())));

  h3("onset");
  knobs.appendChild(numberKnob("window", s.onset.windowFrames, 1, (v) => ((s.onset.windowFrames = v), rebakeDebounced())));
  knobs.appendChild(numberKnob("decay", s.onset.decayPerFrame, 0.05, (v) => ((s.onset.decayPerFrame = v), rebakeDebounced())));

  h3("curves");
  knobs.appendChild(checkbox("volume", state.toggles.volume, (v) => ((state.toggles.volume = v), redraw())));
  knobs.appendChild(checkbox("onset", state.toggles.onset, (v) => ((state.toggles.onset = v), redraw())));
  state.toggles.buckets.forEach((on, b) => {
    knobs.appendChild(checkbox(`bucket ${b}`, on, (v) => ((state.toggles.buckets[b] = v), redraw())));
  });

  h3("settings (copy into Blender)");
  const out = document.createElement("textarea");
  out.id = "settings-out";
  out.readOnly = true;
  out.value = JSON.stringify(s, null, 1);
  knobs.appendChild(out);
  const note = document.createElement("div");
  note.className = "note";
  note.textContent = "analysis is mono, as baked";
  knobs.appendChild(note);
}

function renderSidebar(model: ReturnType<typeof buildSidebarModel>): void {
  const sidebar = document.getElementById("sidebar") as HTMLElement;
  sidebar.replaceChildren();
  let active: HTMLButtonElement | null = null;
  for (const song of model.songs) {
    const h = document.createElement("h3");
    h.textContent = song.song;
    sidebar.appendChild(h);
    for (const band of song.bands) {
      const hb = document.createElement("h4");
      hb.textContent = band.band;
      sidebar.appendChild(hb);
      for (const stem of band.stems) {
        const btn = document.createElement("button");
        btn.textContent = stem.name;
        btn.addEventListener("click", () => {
          active?.classList.remove("active");
          active = btn;
          btn.classList.add("active");
          void selectStem(stem).catch((e) => showError(String(e)));
        });
        sidebar.appendChild(btn);
      }
    }
  }
}

async function main(): Promise<void> {
  const files: { song: string; name: string }[] = await (await fetch("/__stems")).json();
  if (files.length === 0) {
    showError(
      "No stems found in public/audio/wav.\nIn a worktree, public/audio is a symlink — run tools/worktree-dev.sh to set it up."
    );
  }
  const appConfig = appConfigJson as unknown as AppConfigSong[];
  renderSidebar(buildSidebarModel(appConfig, files));
  renderKnobs();
  sizeCanvas();
  debug.ready = true;
}

main().catch((err) => showError(String(err)));
