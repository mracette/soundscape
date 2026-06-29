import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const OUTDIR = resolve(HERE, "__generated__");
mkdirSync(OUTDIR, { recursive: true });
const WAV = resolve(OUTDIR, "test-tone.wav");
const OUT = resolve(OUTDIR, "test-bake.json");

// 0.5s broadband LCG noise then 0.5s silence, mono 44100, 16-bit PCM.
function writeWav(path, sampleRate, durationSec, toneSec) {
  const n = Math.floor(durationSec * sampleRate);
  const active = Math.floor(toneSec * sampleRate);
  const samples = new Float32Array(n);
  let s = 1 >>> 0;
  for (let i = 0; i < active; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    samples[i] = (s / 0xffffffff) * 2 - 1;
  }
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24); buf.writeUInt32LE(sampleRate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v < 0 ? v * 0x8000 : v * 0x7fff), 44 + i * 2);
  }
  writeFileSync(path, buf);
}

function mean(xs) { return xs.reduce((a, b) => a + b, 0) / xs.length; }

function fail(msg) { console.log("FAIL", msg); process.exit(1); }

writeWav(WAV, 44100, 1, 0.5);

execFileSync("node", [
  resolve(HERE, "bake-audio.mjs"),
  "--audio", WAV, "--out", OUT,
  "--fps", "30", "--buckets", "8", "--band", "test",
  "--config", '{"power":11,"smoothingTimeConstant":0,"minFrequency":20,"maxFrequency":16500}',
], { stdio: "inherit", timeout: 120000 });

const r = JSON.parse(readFileSync(OUT, "utf8"));
if (r.fps !== 30) fail(`fps ${r.fps}`);
if (Math.abs(r.frames.length - 30) > 1) fail(`frames ${r.frames.length}`);
if (!r.frames.every((f) => Number.isFinite(f.volume) && f.buckets.length === 8 && f.buckets.every(Number.isFinite))) fail("non-finite or wrong bucket count");
const tone = mean(r.frames.slice(0, 14).map((f) => f.volume));
const silence = mean(r.frames.slice(-8).map((f) => f.volume));
if (!(tone > silence + 0.05)) fail(`tone(${tone.toFixed(3)}) not > silence(${silence.toFixed(3)})+0.05`);

console.log(`OK test-bake-audio (tone=${tone.toFixed(3)} > silence=${silence.toFixed(3)}, ${r.frames.length} frames)`);
