#!/usr/bin/env node
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI = join(ROOT, "tools/blender/bake/bake-audio.mjs");

// Defaults mirror the stem inspector's DEFAULT_SETTINGS — inspector-tuned
// numbers are the shipped numbers.
const DEFAULT_BAKE = {
  fps: 30,
  numBuckets: 8,
  snappy: { coef: 0.5, leadFrames: 2 },
  onset: { windowFrames: 9, decayPerFrame: 0.8 },
};

function parseArgs(argv) {
  const [songId, ...rest] = argv;
  const a = { songId };
  for (let i = 0; i < rest.length; i += 2) a[rest[i].replace(/^--/, "")] = rest[i + 1];
  return a;
}

const args = parseArgs(process.argv.slice(2));
if (!args.songId) {
  console.error("usage: bake-song <songId> [--config src/app-config.json] [--audio-dir public/audio/wav/<songId>] [--out-dir public/bakes/<songId>]");
  console.error("bakes should be generated from the same WAVs the shipped mp3s are encoded from (mp3 encoder delay shifts content ~26ms; this is why lookup below prefers wav over mp3)");
  process.exit(1);
}
const configPath = resolve(args.config ?? join(ROOT, "src/app-config.json"));
const song = JSON.parse(readFileSync(configPath, "utf8")).find((s) => s.id === args.songId);
if (!song) {
  console.error(`song "${args.songId}" not found in ${configPath}`);
  process.exit(1);
}
const audioDir = resolve(args["audio-dir"] ?? join(ROOT, "public/audio/wav", args.songId));
const outDir = resolve(args["out-dir"] ?? join(ROOT, "public/bakes", args.songId));
mkdirSync(outDir, { recursive: true });

let failures = 0;
for (const group of song.audio.groups) {
  const bake = { ...DEFAULT_BAKE, ...(group.bake ?? {}) };
  const snappy = { ...DEFAULT_BAKE.snappy, ...(group.bake?.snappy ?? {}) };
  const onset = { ...DEFAULT_BAKE.onset, ...(group.bake?.onset ?? {}) };
  for (const voice of group.voices) {
    const audio = ["wav", "mp3"].map((ext) => join(audioDir, `${voice.name}.${ext}`)).find(existsSync);
    if (!audio) {
      console.error(`SKIP ${voice.name}: no audio in ${audioDir}`);
      failures++;
      continue;
    }
    const out = join(outDir, `${voice.name}.json`);
    execFileSync("node", [
      CLI,
      "--audio", audio,
      "--out", out,
      "--fps", String(bake.fps),
      "--buckets", String(bake.numBuckets),
      "--band", group.name,
      "--config", JSON.stringify(group.analyser),
      "--snappy-coef", String(snappy.coef),
      "--snappy-lead", String(snappy.leadFrames),
      "--onset-window", String(onset.windowFrames),
      "--onset-decay", String(onset.decayPerFrame),
    ], { stdio: "inherit", timeout: 120_000 });
  }
}
if (failures > 0) {
  console.error(`bake-song: ${failures} voice(s) had no audio — bakes incomplete`);
  process.exit(1);
}
console.log(`OK bake-song ${args.songId}`);
