import { test, expect } from "@playwright/test";

// The harness bakes 1s of broadband noise (first 0.5s) then silence at 30fps, 8
// buckets, twice: raw (smoothing 0) and smoothed (smoothing 0.8, a real-band value).
// Frame 5 (~0.18s) is inside the noise; frame 20 (~0.68s) is fully into silence
// (past the FFT window), frame 25 (~0.85s) deeper still.
test("headless bake produces a faithful per-frame band signal from audio", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/blender-bake.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.__blenderBake?.ready === true, null, { timeout: 30000 });

  const { raw, smoothed } = await page.evaluate(() => window.__blenderBake);

  // --- raw pass (smoothing 0): instantaneous, silence is ~0 ---
  expect(raw.fps).toBe(30);
  expect(raw.frames.length).toBe(30);
  for (const f of raw.frames) {
    expect(Number.isFinite(f.volume)).toBe(true);
    expect(f.volume).toBeGreaterThanOrEqual(0);
    expect(f.buckets.length).toBe(8);
    for (const b of f.buckets) {
      expect(Number.isFinite(b)).toBe(true);
      expect(b).toBeGreaterThanOrEqual(0);
    }
  }
  const active = raw.frames[5];
  const silence = raw.frames[25];
  expect(active.volume).toBeGreaterThan(0.05);
  expect(silence.volume).toBeLessThan(0.02);
  expect(active.volume).toBeGreaterThan(silence.volume);
  expect(Math.max(...active.buckets)).toBeGreaterThan(0.05);

  // --- smoothed pass (smoothing 0.8): the technique must work for real bands too ---
  expect(smoothed.frames.length).toBe(30);
  for (const f of smoothed.frames) {
    expect(Number.isFinite(f.volume)).toBe(true);
    expect(f.volume).toBeGreaterThanOrEqual(0);
    for (const b of f.buckets) expect(Number.isFinite(b)).toBe(true);
  }
  expect(smoothed.frames[5].volume).toBeGreaterThan(0.05); // tracks audio
  // A frame fully into silence: the smoothed bake retains a decaying residual the
  // raw bake does not -> proves the offline render captures the analyser's smoothing.
  expect(smoothed.frames[20].volume).toBeGreaterThan(raw.frames[20].volume + 0.02);

  expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toHaveLength(0);
});
