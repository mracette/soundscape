import appConfigJson from "../../../../app-config.json";
import { toMono } from "../../bake/bakeUtils";
import { analyzeStem, DEFAULT_SETTINGS, type BakeSettings, type StemAnalysis } from "./analysis";
import { drawInspector, type CurveToggles } from "./draw";
import { StemPlayer } from "./player";
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
const player = new StemPlayer();
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
  const debounced = (...a: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
  debounced.cancel = () => clearTimeout(t);
  return debounced;
}

async function rebake(): Promise<void> {
  if (!state.audio || !state.samples) return;
  const bucketsChanged = state.toggles.buckets.length !== state.settings.numBuckets;
  state.analysis = await analyzeStem(state.samples, state.audio.sampleRate, state.settings);
  state.toggles.buckets = state.toggles.buckets.slice(0, state.settings.numBuckets);
  while (state.toggles.buckets.length < state.settings.numBuckets) state.toggles.buckets.push(false);
  debug.frames = frames().length;
  // Rebuilding the whole knobs panel here would destroy+recreate the input the
  // user is actively typing in (losing focus/cursor) on every debounced rebake.
  // Only rerender the pieces whose contents actually changed.
  if (bucketsChanged) renderBucketToggles();
  updateSettingsOutput();
  redraw();
}
const rebakeDebounced = debounce(() => void rebake().catch((e) => showError(String(e))), 150);

const audioCache = new Map<string, AudioBuffer>();

async function selectStem(stem: StemEntry): Promise<void> {
  // A knob edit on the previous stem may still have a rebake pending; without
  // this, its stale timer fires after this stem's synchronous rebake below,
  // clobbering it with a redundant analyzeStem for the wrong settings.
  rebakeDebounced.cancel();
  clearError();
  if (!audioCache.has(stem.url)) {
    const res = await fetch(stem.url);
    if (!res.ok) throw new Error(`fetch ${stem.url}: HTTP ${res.status}`);
    // Decode at 44100 (the CLI's default bake rate, see bakeAudioHarness.ts) rather
    // than the hardware rate a plain AudioContext would use — the Analyser bucket
    // bin edges derive from context.sampleRate, so a mismatch would misalign
    // analysis here vs. what the CLI actually bakes.
    const decodeCtx = new OfflineAudioContext(1, 1, 44100);
    audioCache.set(stem.url, await decodeCtx.decodeAudioData(await res.arrayBuffer()));
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
  renderKnobs(); // preset values changed with the stem -> inputs must re-fill
  player.load(state.audio);
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
  const bucketsContainer = document.createElement("div");
  bucketsContainer.id = "bucket-toggles";
  knobs.appendChild(bucketsContainer);
  renderBucketToggles();

  h3("settings (copy into Blender)");
  const out = document.createElement("textarea");
  out.id = "settings-out";
  out.readOnly = true;
  knobs.appendChild(out);
  updateSettingsOutput();
  const note = document.createElement("div");
  note.className = "note";
  note.textContent = "analysis is mono, as baked";
  knobs.appendChild(note);
}

// Stable container so a bucket-count change (the only thing that invalidates
// these checkboxes) doesn't force a rerender of the whole knobs panel.
function renderBucketToggles(): void {
  const container = document.getElementById("bucket-toggles") as HTMLElement;
  container.replaceChildren();
  state.toggles.buckets.forEach((on, b) => {
    container.appendChild(checkbox(`bucket ${b}`, on, (v) => ((state.toggles.buckets[b] = v), redraw())));
  });
}

function updateSettingsOutput(): void {
  const out = document.getElementById("settings-out") as HTMLTextAreaElement;
  out.value = JSON.stringify(state.settings, null, 1);
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

function renderTransport(): void {
  const transport = document.getElementById("transport") as HTMLElement;
  const playBtn = document.createElement("button");
  playBtn.id = "play";
  playBtn.textContent = "play/pause";
  playBtn.addEventListener("click", () => player.toggle());
  const loopLabel = checkbox("loop", false, (v) => player.setLoop(v));
  transport.append(playBtn, loopLabel);
}

canvas.addEventListener("click", (ev) => {
  if (!state.audio) return;
  const rect = canvas.getBoundingClientRect();
  player.seek(((ev.clientX - rect.left) / rect.width) * state.audio.duration);
});

function tick(): void {
  requestAnimationFrame(tick);
  if (!state.audio) return;
  state.playheadSec = player.position;
  const fs = frames();
  const idx = Math.min(fs.length - 1, Math.floor(state.playheadSec * state.settings.fps));
  const f = fs[idx];
  const readout = document.getElementById("readout") as HTMLElement;
  readout.textContent = f
    ? `t=${state.playheadSec.toFixed(2)}s  frame=${idx}  volume=${f.volume.toFixed(3)}  onset=${f.onset.toFixed(3)}`
    : "";
  redraw();
}

async function main(): Promise<void> {
  const stemsRes = await fetch("/__stems");
  if (!stemsRes.ok) throw new Error(`/__stems: HTTP ${stemsRes.status}`);
  const files: { song: string; name: string }[] = await stemsRes.json();
  if (files.length === 0) {
    showError(
      "No stems found in public/audio/wav.\nIn a worktree, public/audio is a symlink — run tools/worktree-dev.sh to set it up."
    );
  }
  const appConfig = appConfigJson as unknown as AppConfigSong[];
  renderSidebar(buildSidebarModel(appConfig, files));
  renderKnobs();
  renderTransport();
  sizeCanvas();
  tick();
  debug.ready = true;
}

main().catch((err) => showError(String(err)));
