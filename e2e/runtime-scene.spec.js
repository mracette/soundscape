import { test, expect } from "@playwright/test";

// RuntimeScene loads a GLB with two position.y-bound cubes and drives them from
// two signal-source shapes: a page-scripted level and a synthetic baked bake
// whose playback position the page advances. Both must move their binding.
test("RuntimeScene drives bindings from scripted and baked sources", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/runtime-scene.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.__runtimeScene?.loaded === true);

  const before = await page.evaluate(() => window.__runtimeScene.sample());
  await page.evaluate(() => window.__runtimeScene.setLevel(1));
  await page.waitForFunction(
    (b) => Math.abs(window.__runtimeScene.sample() - b) > 0.1,
    before
  );

  await page.evaluate(() => window.__runtimeScene.setBakedPosition(0));
  const quiet = await page.evaluate(() => window.__runtimeScene.sampleBaked());
  await page.evaluate(() => window.__runtimeScene.setBakedPosition(0.75));
  await page.waitForFunction(
    (q) => Math.abs(window.__runtimeScene.sampleBaked() - q) > 0.1,
    quiet
  );

  expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toHaveLength(
    0
  );
});
