import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";

// Prelude plays scratch stems; skip when the audio fixtures haven't been generated
// (fresh clone without `node tools/prelude-fixture-stems.mjs`).
const HAVE_AUDIO = existsSync("public/audio/vbr/prelude/bass-a.mp3");

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

  // bass-orb's emissiveIntensity is bound to the bass band with outMin 0.2, so it
  // rests at ~0.2 while nothing is playing.
  const baseline = await page.evaluate(() =>
    window.__runtimeSceneDebug.sample("bass-orb")
  );
  expect(baseline).toBeLessThan(0.3);

  // Start the first bass voice (bass-a). With quantizeSamples on it begins at the
  // next 4m boundary (up to ~9.6s at bpm 100).
  const bass = page
    .locator(".toggle-button-group")
    .filter({ has: page.locator("h3", { hasText: "bass" }) });
  await bass.locator(".toggle-button").first().click();

  // Once bass-a is audible the smoothed bass volume drives emissiveIntensity well
  // above its 0.2 rest. Allow the quantize boundary plus smoothing headroom.
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
