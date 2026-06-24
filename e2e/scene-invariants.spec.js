const { test, expect } = require("@playwright/test");
const {
  SONGS,
  installWebglCounter,
  webglContextCount,
  gotoScene,
  getGroup,
} = require("./helpers");

for (const song of SONGS) {
  test(`${song}: exactly one WebGL context, stable across interaction`, async ({
    page,
  }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err));
    await installWebglCounter(page);
    await gotoScene(page, song);

    // After load: exactly one webgl context on the scene canvas.
    expect(await webglContextCount(page, "canvas-viz")).toBe(1);

    // Toggle a voice -> the scene must NOT re-initialize (the regression).
    await page.locator(".toggle-button").first().click();
    await page.waitForTimeout(1500);
    expect(await webglContextCount(page, "canvas-viz")).toBe(1);

    // Open another menu panel (effects) and the home panel.
    await page.locator(".menu-button-child").nth(2).click(); // effects
    await page.locator(".menu-button-child").nth(0).click(); // home
    await page.waitForTimeout(500);
    expect(await webglContextCount(page, "canvas-viz")).toBe(1);

    // Randomize then reset.
    await page.locator(".menu-button-child").nth(1).click(); // toggles
    await page.locator("#toggle-button-panel-randomize").click();
    await page.waitForTimeout(1000);
    await page.locator("#toggle-button-panel-reset").click();
    await page.waitForTimeout(1000);
    expect(await webglContextCount(page, "canvas-viz")).toBe(1);

    expect(pageErrors.map((e) => e.message).join("\n")).toBe("");
  });
}

test("switching songs gives the new scene exactly one context", async ({
  page,
}) => {
  await installWebglCounter(page);
  await gotoScene(page, "swamp");
  expect(await webglContextCount(page, "canvas-viz")).toBe(1);
  await gotoScene(page, "moonrise");
  // The counter resets on full navigation (new document), so the new scene's
  // canvas again shows exactly one context.
  expect(await webglContextCount(page, "canvas-viz")).toBe(1);
});
