import { test, expect } from "@playwright/test";

// The harness bakes 1s of broadband noise (first 0.5s) then silence, at 30fps,
// 8 buckets. Frame 5 (~0.18s) is inside the noise; frame 25 (~0.85s) is silence.
test("headless bake produces a faithful per-frame band signal from audio", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/blender-bake.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.__blenderBake?.ready === true, null, { timeout: 30000 });

  const result = await page.evaluate(() => window.__blenderBake.result);

  expect(result.fps).toBe(30);
  expect(result.frames.length).toBe(30);

  // every value finite and normalized
  for (const f of result.frames) {
    expect(Number.isFinite(f.volume)).toBe(true);
    expect(f.volume).toBeGreaterThanOrEqual(0);
    expect(f.buckets.length).toBe(8);
    for (const b of f.buckets) {
      expect(Number.isFinite(b)).toBe(true);
      expect(b).toBeGreaterThanOrEqual(0);
    }
  }

  const active = result.frames[5];
  const silence = result.frames[25];
  expect(active.volume).toBeGreaterThan(0.05);          // sound is clearly present
  expect(silence.volume).toBeLessThan(0.02);            // silence is quiet
  expect(active.volume).toBeGreaterThan(silence.volume); // bake tracks the audio
  expect(Math.max(...active.buckets)).toBeGreaterThan(0.05);

  expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toHaveLength(0);
});
