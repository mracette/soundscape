import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const URL = opt("--url", "http://localhost:3100");
const SONG = opt("--song", "all");
const LABEL = opt("--label", "baseline");
const HEADED = args.includes("--headed");
const SONGS = SONG === "all" ? ["swamp", "mornings", "moonrise"] : [SONG];

const here = dirname(fileURLToPath(import.meta.url));

const b = await chromium.launch({ headless: !HEADED });
const p = await b.newPage();

// React commit counter (no app change) + long-task observer, before app load.
// Re-runs on every navigation, so counts are per-scene.
await p.addInitScript(() => {
  let commits = 0;
  window.__commits = () => commits;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true, renderers: new Map(), _id: 0,
    inject(r) { const id = ++this._id; this.renderers.set(id, r); return id; },
    onScheduleFiberRoot() {}, onCommitFiberUnmount() {}, onPostCommitFiberRoot() {},
    onCommitFiberRoot() { commits++; },
  };
  window.__longtasks = 0;
  try {
    new PerformanceObserver((l) => { window.__longtasks += l.getEntries().length; })
      .observe({ entryTypes: ["longtask"] });
  } catch { /* longtask unsupported */ }
});

const cdp = await p.context().newCDPSession(p);
const heapMB = async () => {
  const { usedSize } = await cdp.send("Runtime.getHeapUsage").catch(() => ({ usedSize: 0 }));
  return +(usedSize / 1048576).toFixed(1);
};

const report = {
  label: LABEL,
  url: URL,
  headed: HEADED,
  when: new Date().toISOString(),
  scenes: [],
};

for (const song of SONGS) {
  await p.goto(`${URL}/play/${song}?perf=1`, { waitUntil: "domcontentloaded" });
  await p.locator("#canvas-viz").waitFor({ state: "attached", timeout: 45000 });
  await p.waitForTimeout(4000); // warm-up frames before first sample

  const samples = [];
  const sample = async (label) => {
    const snap = await p.evaluate(() => window.__perf?.snapshot() ?? null);
    samples.push({
      label,
      cpuMs: snap?.cpuMs ?? null,
      gpuMs: snap?.gpuMs ?? null,
      gpuAvailable: snap?.gpuAvailable ?? false,
      budgetPct: snap?.budgetPct ?? null,
      heapMB: await heapMB(),
      commits: await p.evaluate(() => window.__commits()),
      longtasks: await p.evaluate(() => window.__longtasks),
    });
  };

  await sample("idle");
  const toggles = p.locator(".toggle-button");
  const n = Math.min(4, await toggles.count());
  for (let i = 0; i < n; i++) { await toggles.nth(i).click(); await p.waitForTimeout(700); }
  await p.waitForTimeout(2000);
  await sample("4 voices active");
  await p.locator("#toggle-button-panel-randomize").click().catch(() => {});
  await p.waitForTimeout(2500);
  await sample("after randomize");

  report.scenes.push({ song, samples });
}

const outDir = join(here, "reports");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${LABEL}.json`), JSON.stringify(report, null, 2));

// Markdown summary to stdout — one table per scene.
const cell = (v) => (v === null || v === undefined ? "—" : v);
let anyGpu = false;
console.log(`\n# Perf report: ${LABEL} (${HEADED ? "headed/real-GPU" : "headless"})`);
for (const { song, samples } of report.scenes) {
  console.log(`\n## ${song}`);
  console.log("| checkpoint | CPU ms | GPU ms | budget % | heap MB | commits | longtasks |");
  console.log("|---|---|---|---|---|---|---|");
  for (const s of samples) {
    if (s.gpuAvailable) anyGpu = true;
    console.log(`| ${s.label} | ${cell(s.cpuMs?.toFixed?.(2))} | ${cell(s.gpuMs?.toFixed?.(2))} | ${cell(s.budgetPct?.toFixed?.(0))} | ${cell(s.heapMB)} | ${cell(s.commits)} | ${cell(s.longtasks)} |`);
  }
}
if (!anyGpu) {
  console.log(`\n_GPU ms unavailable (headless SwiftShader). Run with \`--headed\` on real hardware for GPU timing._`);
}
console.log(`\nJSON: tools/perf/reports/${LABEL}.json`);
await b.close();
