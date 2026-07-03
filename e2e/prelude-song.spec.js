import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";

// Prelude plays real stems; skip when the audio isn't present (fresh clone
// without the gitignored public/audio, or before stems are dropped in).
const HAVE_AUDIO = existsSync("public/audio/vbr/prelude/bass-one[8].mp3");

test.skip(!HAVE_AUDIO, "prelude fixture stems not generated");

test("prelude loads, plays a voice, and the baked viz reacts", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/play/prelude", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#canvas-viz")).toBeVisible();
  await expect(page.locator("#loading-screen")).toHaveCount(0, {
    timeout: 30_000,
  });
  // RuntimeScene exposes this once it constructs; sample reads a bound object's
  // live emissiveIntensity by name.
  await page.waitForFunction(
    () => typeof window.__runtimeSceneDebug?.sample === "function"
  );

  // The scene must render as more than a black frame the moment it loads, before
  // any voice starts — a lit, camera-framed scene with visible objects. Sampling
  // the WebGL framebuffer (render + readPixels) guards against an unrenderable GLB
  // (no light, black emissive, camera aimed away) that the value-only sample misses.
  const pixels = await page.evaluate(() =>
    window.__runtimeSceneDebug.pixelSum()
  );
  expect(
    pixels.nonBlack / pixels.total,
    `non-black fraction ${pixels.nonBlack}/${pixels.total}`
  ).toBeGreaterThan(0.1);

  // bass-orb's emissiveIntensity is bound to the bass band with outMin 0.2, so it
  // rests at ~0.2 while nothing is playing.
  const baseline = await page.evaluate(() =>
    window.__runtimeSceneDebug.sample("bass-orb")
  );
  expect(baseline).toBeLessThan(0.3);

  // Start bass-two[4]. With quantizeSamples on it begins at the next 4m boundary
  // (up to ~10.4s at bpm 92); its baked bass volume clears 0.5 within ~0.3s of
  // playing. bass-one[8] would quantize to an 8m (~20.9s) boundary that overruns
  // the poll below, so toggle the [4] voice — bass-orb reacts to the whole group.
  const bass = page
    .locator(".toggle-button-group")
    .filter({ has: page.locator("h3", { hasText: "bass" }) });
  await bass.locator(".toggle-button").nth(1).click();

  // Once bass-two[4] is audible the smoothed bass volume drives emissiveIntensity
  // well above its 0.2 rest. Allow the quantize boundary plus smoothing headroom.
  await expect
    .poll(
      () => page.evaluate(() => window.__runtimeSceneDebug.sample("bass-orb")),
      { timeout: 20_000 }
    )
    .toBeGreaterThan(0.5);

  expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toHaveLength(
    0
  );
});
