import { test, expect } from "@playwright/test";

// The fixture binding maps emissiveIntensity <- bass volume over [0,1] with no
// smoothing, so a constant signal of 0 yields 0 and 1 yields ~1 in one frame.
test("glTF extras drive the runtime end-to-end in WebGL", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/blender-runtime.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.__blenderRuntime?.ready === true);

  const low = await page.evaluate(() => {
    window.__blenderRuntime.setSignal(0);
    return window.__blenderRuntime.tick();
  });
  expect(low).toBeCloseTo(0, 5);

  const high = await page.evaluate(() => {
    window.__blenderRuntime.setSignal(1);
    return window.__blenderRuntime.tick();
  });
  expect(high).toBeGreaterThan(0.99);

  expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toHaveLength(0);
});
