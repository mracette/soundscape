#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import { chromium } from "@playwright/test";

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) a[argv[i].replace(/^--/, "")] = argv[i + 1];
  return a;
}

const DEFAULT_CONFIG = {
  power: 11,
  smoothingTimeConstant: 0.8,
  minFrequency: 20,
  maxFrequency: 16500,
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.audio || !args.out) {
    throw new Error("usage: bake-audio --audio <path> --out <path> [--fps 30] [--buckets 8] [--band bass] [--sample-rate 44100] [--config <json|path>]");
  }
  const audioPath = resolve(args.audio);
  if (!existsSync(audioPath)) throw new Error(`audio not found: ${audioPath}`);

  const fps = Number(args.fps ?? 30);
  const numBuckets = Number(args.buckets ?? 8);
  const band = args.band ?? "bass";
  const sampleRate = Number(args["sample-rate"] ?? 44100);
  let analyserConfig = DEFAULT_CONFIG;
  if (args.config) {
    analyserConfig = existsSync(args.config)
      ? JSON.parse(readFileSync(args.config, "utf8"))
      : JSON.parse(args.config);
  }

  const b64 = readFileSync(audioPath).toString("base64");

  const server = await createServer({ server: { port: 0 } });
  await server.listen();
  const url = server.resolvedUrls.local[0];
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => { throw e; });
    await page.goto(`${url}blender-bake-audio.html`, { waitUntil: "load" });
    await page.waitForFunction(() => window.__bakeReady === true);
    const result = await page.evaluate(
      async ({ b64, opts }) => window.__bakeAudio(b64, opts),
      { b64, opts: { analyserConfig, fps, numBuckets, band, sampleRate } }
    );
    writeFileSync(resolve(args.out), JSON.stringify(result));
    console.log(`WROTE ${args.out} (${result.frames.length} frames @ ${result.fps}fps)`);
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((err) => {
  console.error("BAKE FAILED:", err?.message ?? err);
  process.exit(1);
});
