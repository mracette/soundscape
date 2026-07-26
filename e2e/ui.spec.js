import { test, expect } from "@playwright/test";
import { gotoScene } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await gotoScene(page, "swamp");
});

test("each menu panel opens and renders its content", async ({ page }) => {
  // DOM order of the menu buttons: home, toggles, effects, song-info.
  // The toggles panel auto-opens; assert it is already visible.
  await expect(page.locator("#toggle-button-panel")).toBeVisible();

  await page.getByTestId("menu-button-child").nth(0).click(); // home
  await expect(page.locator("#home-panel")).toBeVisible();

  await page.getByTestId("menu-button-child").nth(2).click(); // effects
  await expect(page.locator("#effects-panel")).toBeVisible();

  await page.getByTestId("menu-button-child").nth(3).click(); // song-info
  await expect(page.locator("#song-info-panel")).toBeVisible();
});

test("the loading screen clears after the scene loads", async ({ page }) => {
  // gotoScene already waits for it to clear; assert it is gone.
  await expect(page.locator("#loading-screen")).toHaveCount(0);
});

test("effects sliders are present and toggling them does not error", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));
  await page.getByTestId("menu-button-child").nth(2).click(); // effects
  const checkboxes = page.locator('#effects-panel input[type="checkbox"]');
  expect(await checkboxes.count()).toBeGreaterThan(0);
  // The checkbox inputs are visually hidden (opacity:0;width:0;height:0);
  // click the visible switch track span that wraps each one instead.
  const toggles = page.locator("#effects-panel").getByTestId("switch");
  const n = await toggles.count();
  for (let i = 0; i < n; i++) {
    await toggles.nth(i).click();
  }
  await page.waitForTimeout(500);
  for (let i = 0; i < n; i++) {
    await toggles.nth(i).click();
  }
  expect(pageErrors.map((e) => e.message).join("\n")).toBe("");
});
