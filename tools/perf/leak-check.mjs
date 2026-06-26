// Leak check: toggle voices over a long session and watch the things that leak —
// live GSAP tweens, pending scheduler events, store voices, and JS heap. Stable
// counts = no leak; monotonic growth = a leak. Run from time to time (not CI):
//   node tools/perf/leak-check.mjs                 # defaults: swamp, 40 toggles @2s
//   node tools/perf/leak-check.mjs --toggles 100 --spacing 2500 --song mornings
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const URL = opt("--url", "http://localhost:3100");
const SONG = opt("--song", "swamp");
const TOGGLES = +opt("--toggles", "40");
const SPACING = +opt("--spacing", "2000"); // ms between toggles — let animations fire/complete
const HEADED = args.includes("--headed");

const b = await chromium.launch({ headless: !HEADED });
const p = await b.newPage();
await p.goto(`${URL}/play/${SONG}`, { waitUntil: "domcontentloaded" });
await p.locator("#canvas-viz").waitFor({ state: "attached", timeout: 45000 });
await p.waitForTimeout(2500);

const cdp = await p.context().newCDPSession(p);
const metrics = async () => {
  await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
  const r = await cdp.send("Runtime.getHeapUsage").catch(() => ({ usedSize: 0 }));
  const s = await p.evaluate(() => {
    const a = window.__soundscape;
    return {
      tweens: a?.gsapTweens?.() ?? -1,
      queue: a?.schedulerQueue?.() ?? -1,
      voices: a?.store?.().voices.length ?? -1,
    };
  });
  return { heapMB: +(r.usedSize / 1048576).toFixed(1), ...s };
};

const rows = [];
const snap = async (label) => rows.push({ label, ...(await metrics()) });

await snap("baseline");
const btns = p.locator(".toggle-button");
const n = await btns.count();
const every = Math.max(1, Math.floor(TOGGLES / 4));
for (let i = 1; i <= TOGGLES; i++) {
  await btns.nth(i % n).click();
  await p.waitForTimeout(SPACING);
  if (i % every === 0) await snap(`${i} toggles`);
}

// Quiesce before the final reading so it's idle-to-idle vs the baseline —
// otherwise in-flight tweens/events (which release on completion) false-positive.
await p
  .waitForFunction(
    () => {
      const a = window.__soundscape;
      return (a?.gsapTweens?.() ?? 1) === 0 && (a?.schedulerQueue?.() ?? 1) === 0;
    },
    { timeout: 12000 }
  )
  .catch(() => {});
await p.waitForTimeout(1000);
await snap("settled (idle)");

console.log(`\n# Leak check: ${SONG}, ${TOGGLES} toggles @ ${SPACING}ms (${HEADED ? "headed" : "headless"})`);
console.log("| checkpoint | heap MB | gsap tweens | scheduler queue | voices |");
console.log("|---|---|---|---|---|");
for (const r of rows) {
  console.log(`| ${r.label} | ${r.heapMB} | ${r.tweens} | ${r.queue} | ${r.voices} |`);
}
const base = rows[0];
const end = rows[rows.length - 1];
const grew = (a, z, name, tol) => (z - a > tol ? `${name} grew ${a}→${z}` : null);
const flags = [
  grew(base.heapMB, end.heapMB, "heap MB", 8),
  grew(base.tweens, end.tweens, "gsap tweens", 5),
  grew(base.queue, end.queue, "scheduler queue", 5),
  grew(base.voices, end.voices, "voices", 0),
].filter(Boolean);
console.log("\n" + (flags.length ? "⚠  POSSIBLE LEAK: " + flags.join("; ") : "✓  No leak: heap / tweens / scheduler queue / voices all stable."));
await b.close();
