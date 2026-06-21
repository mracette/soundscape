const { test, expect } = require("@playwright/test");

const sceneRoutes = [
  { path: "/", canvas: "#landing-page-canvas" },
  { path: "/play/swamp", canvas: "#canvas-viz" },
  { path: "/play/mornings", canvas: "#canvas-viz" },
  { path: "/play/moonrise", canvas: "#canvas-viz" },
];

for (const { path, canvas } of sceneRoutes) {
  test(`${path} boots with a canvas and no uncaught errors`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    await page.goto(path, { waitUntil: "domcontentloaded" });
    // The canvas mounts with the scene component, independent of asset/audio
    // load time, so assert it is attached rather than waiting for it to paint.
    await expect(page.locator(canvas)).toBeAttached({ timeout: 30_000 });

    // Give async scene init a moment to surface any thrown error.
    await page.waitForTimeout(3_000);

    expect(
      pageErrors,
      pageErrors.map((e) => e.message).join("\n")
    ).toHaveLength(0);
  });
}

test("/info renders without uncaught errors", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/info", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#app")).not.toBeEmpty();

  expect(
    pageErrors,
    pageErrors.map((e) => e.message).join("\n")
  ).toHaveLength(0);
});
