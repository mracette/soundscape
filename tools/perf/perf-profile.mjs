// Capture a function-level CPU profile of a scene at full visual load
// (one voice per group active), and print the top self-time functions.
// Run HEADED on real hardware to capture the real driver/JS cost:
//   node tools/perf/perf-profile.mjs --headed --song mornings
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const URL = opt("--url", "http://localhost:3100");
const SONG = opt("--song", "mornings");
const SECS = +opt("--secs", "5");
const HEADED = args.includes("--headed");
const here = dirname(fileURLToPath(import.meta.url));

const b = await chromium.launch({ headless: !HEADED });
const p = await b.newPage();
await p.goto(`${URL}/play/${SONG}?perf=1`, { waitUntil: "domcontentloaded" });
await p.locator("#canvas-viz").waitFor({ state: "attached", timeout: 45000 });
await p.waitForTimeout(4000);

// Activate one voice per group (unlock all visuals), wait until actually active.
const groups = p.locator(".toggle-button-group");
const gn = await groups.count();
for (let i = 0; i < gn; i++) {
  await groups.nth(i).locator(".toggle-button").first().click();
}
await p
  .waitForFunction(
    () => {
      const s = window.__soundscape?.store();
      if (!s || s.voices.length === 0) return false;
      const all = new Set(s.voices.map((v) => v.group));
      const act = new Set(
        s.voices.filter((v) => v.voiceState === "active").map((v) => v.group)
      );
      return act.size >= all.size;
    },
    { timeout: 30000 }
  )
  .catch(() => {});
await p.waitForTimeout(1500);

const cdp = await p.context().newCDPSession(p);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 }); // microseconds
await cdp.send("Profiler.start");
await p.waitForTimeout(SECS * 1000);
const { profile } = await cdp.send("Profiler.stop");

// Aggregate self-time (hitCount) by call frame.
const byFn = new Map();
for (const n of profile.nodes) {
  if (!n.hitCount) continue;
  const f = n.callFrame;
  const file = (f.url || "").split("/").pop() || f.url || "";
  const key = `${f.functionName || "(anonymous)"}  ${file}:${f.lineNumber + 1}`;
  byFn.set(key, (byFn.get(key) || 0) + n.hitCount);
}
const totalSamples = profile.samples.length;
const sampleMs = 0.2;
const rows = [...byFn.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18);

console.log(`\n# CPU profile: ${SONG} full-load (${HEADED ? "headed/real-GPU" : "headless"}), ${SECS}s, ${totalSamples} samples`);
console.log("| self ms | % | function (file:line) |");
console.log("|---|---|---|");
for (const [k, hits] of rows) {
  console.log(`| ${(hits * sampleMs).toFixed(0)} | ${((100 * hits) / totalSamples).toFixed(1)} | ${k} |`);
}
const outDir = join(here, "reports");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `profile-${SONG}.cpuprofile`), JSON.stringify(profile));
console.log(`\nRaw: tools/perf/reports/profile-${SONG}.cpuprofile (open in Chrome DevTools → Performance → Load profile)`);
await b.close();
