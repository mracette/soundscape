#!/usr/bin/env node
/**
 * Deterministic scratch stems for the `prelude` song slot.
 *
 * SUPERSEDED: real stems now ship in public/audio/vbr/prelude/ (16 voices +
 * ambient-track.mp3) and app-config's prelude entry references them, not the
 * bass-a/beat-a/keys-a voices below. This generator is kept only to bootstrap
 * a CI-less clone that lacks the gitignored real audio.
 *
 * Writes a 4-bar loop per voice at bpm 100 (4 bars x 4 beats x 0.6 s = 9.6 s)
 * into BOTH:
 *   public/audio/wav/prelude/<voice>.wav
 *   public/audio/vbr/prelude/<voice>.mp3   <- WAV bytes under an .mp3 name
 *
 * The `.mp3` files hold WAV bytes on purpose: the app loads voices with format
 * "vbr" (getPathToAudio -> audio/vbr/<id>/<name>.mp3) and decodes them with
 * WebAudio's decodeAudioData, which sniffs the container from the bytes, not the
 * extension. So real PCM under an .mp3 name decodes fine and lets the prelude
 * slot run end-to-end before any real stems exist.
 *
 * These are PLACEHOLDER junk in a gitignored dir (public/audio is a symlink into
 * the main checkout here). Nothing here is committed; only the derived bakes are.
 *
 * Groups/voices mirror the app-config prelude entry so real stems replace files
 * 1:1: bass (bass-a, bass-b), rhythm (beat-a, beat-b), melody (keys-a, keys-b).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SAMPLE_RATE = 44100;
const BPM = 100;
const BEAT_SEC = 60 / BPM; // 0.6 s
const BARS = 4;
const BEATS = BARS * 4; // 16
const DURATION_SEC = BEATS * BEAT_SEC; // 9.6 s

// mono 44100, 16-bit PCM (same layout as tools/test-bake-song.mjs writeWav).
function wavBytes(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24); buf.writeUInt32LE(SAMPLE_RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v < 0 ? v * 0x8000 : v * 0x7fff), 44 + i * 2);
  }
  return buf;
}

// Seeded numerical-recipes LCG in [-1, 1] (matches synthNoise in bakeUtils.ts).
function makeNoise(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

const N = Math.floor(DURATION_SEC * SAMPLE_RATE);

/** Per-beat attack/decay envelope: 1 at the beat, falling over `decaySec`. */
function beatEnvelope(i, decaySec) {
  const t = i / SAMPLE_RATE;
  const phase = t % BEAT_SEC;
  return phase < decaySec ? 1 - phase / decaySec : 0;
}

function bassStem(freq) {
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = 0.6 * beatEnvelope(i, 0.35) * Math.sin(2 * Math.PI * freq * t);
  }
  return out;
}

function beatStem(seed) {
  const noise = makeNoise(seed);
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    out[i] = 0.7 * beatEnvelope(i, 0.08) * noise();
  }
  return out;
}

function keysStem(freqs) {
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const f of freqs) v += Math.sin(2 * Math.PI * f * t);
    out[i] = (0.4 / freqs.length) * v;
  }
  return out;
}

const stems = {
  "bass-a": bassStem(55),
  "bass-b": bassStem(110),
  "beat-a": beatStem(3),
  "beat-b": beatStem(4),
  "keys-a": keysStem([261.63, 329.63, 392.0]), // C major triad
  "keys-b": keysStem([293.66, 349.23, 440.0]), // D minor triad
};

const wavDir = join(ROOT, "public/audio/wav/prelude");
const vbrDir = join(ROOT, "public/audio/vbr/prelude");
mkdirSync(wavDir, { recursive: true });
mkdirSync(vbrDir, { recursive: true });

for (const [name, samples] of Object.entries(stems)) {
  const bytes = wavBytes(samples);
  writeFileSync(join(wavDir, `${name}.wav`), bytes);
  writeFileSync(join(vbrDir, `${name}.mp3`), bytes);
}

console.log(`Wrote ${Object.keys(stems).length} placeholder stems (${DURATION_SEC}s) to:`);
console.log(`  ${wavDir}`);
console.log(`  ${vbrDir}`);
console.log("NOTE: public/audio is a symlink into your main checkout — these are");
console.log("gitignored placeholder files, not committed. Only public/bakes/prelude is.");
