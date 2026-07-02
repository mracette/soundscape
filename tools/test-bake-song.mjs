#!/usr/bin/env node
// Round-trip: scratch WAVs + mini app-config → bake-song → per-voice BakeResult JSONs.
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// mono 44100, 16-bit PCM.
function writeWav(path, samples, sampleRate) {
  const n = samples.length;
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

const dir = mkdtempSync(join(tmpdir(), "bake-song-"));
try {
  const sr = 44100;
  const tone = Float32Array.from({ length: sr }, (_, i) => 0.5 * Math.sin((2 * Math.PI * 220 * i) / sr));
  const silence = new Float32Array(sr);
  writeWav(join(dir, "kick.wav"), tone, sr);
  writeWav(join(dir, "pad.wav"), silence, sr);
  const config = [{
    id: "testsong",
    audio: { name: "testsong", bpm: 100, timeSignature: 4, groups: [
      { name: "bass", analyser: { power: 11, smoothingTimeConstant: 0.8, minFrequency: 20, maxFrequency: 16500 },
        voices: [{ name: "kick" }] },
      { name: "melody", analyser: { power: 11, smoothingTimeConstant: 0.8, minFrequency: 20, maxFrequency: 16500 },
        voices: [{ name: "pad" }] },
    ] },
  }];
  const configPath = join(dir, "config.json");
  writeFileSync(configPath, JSON.stringify(config));
  execFileSync("node", [join(ROOT, "tools/bake-song.mjs"), "testsong",
    "--config", configPath, "--audio-dir", dir, "--out-dir", join(dir, "out")],
    { stdio: "inherit", timeout: 300_000 });
  const kick = JSON.parse(readFileSync(join(dir, "out", "kick.json"), "utf8"));
  const pad = JSON.parse(readFileSync(join(dir, "out", "pad.json"), "utf8"));
  if (kick.band !== "bass" || pad.band !== "melody") throw new Error("band labels wrong");
  const peak = Math.max(...kick.frames.map((f) => f.volume));
  const silent = Math.max(...pad.frames.map((f) => f.volume));
  if (!(peak > silent + 0.02)) throw new Error(`tone ${peak} not > silence ${silent}`);
  if (!kick.frames.every((f) => Number.isFinite(f.onset))) throw new Error("onset missing");
  console.log(`OK test-bake-song tone=${peak.toFixed(3)}>silence=${silent.toFixed(3)}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
