const { test, expect } = require("@playwright/test");
const { gotoScene, SONGS } = require("./helpers");

test("/ renders the landing page with song links", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#landing-page-canvas")).toBeAttached();
  for (const song of SONGS) {
    await expect(page.locator(`a.song-link[href="/play/${song}"]`)).toBeVisible();
  }
});

for (const song of SONGS) {
  test(`/play/${song} mounts the scene and clears the loading screen`, async ({
    page,
  }) => {
    await gotoScene(page, song);
    await expect(page.locator("#canvas-viz")).toBeAttached();
    await expect(page.locator("#toggle-button-panel")).toBeVisible();
  });
}

test("/info shows info content", async ({ page }) => {
  await page.goto("/info", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".info-subheader")).toBeVisible();
});

test("clicking a landing song link navigates to that scene", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator('a.song-link[href="/play/swamp"]').click();
  await expect(page).toHaveURL(/\/play\/swamp$/);
  await expect(page.locator("#canvas-viz")).toBeAttached({ timeout: 30_000 });
});

test("back navigation returns to the landing page", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await gotoScene(page, "swamp");
  await page.goBack();
  await expect(page.locator("#landing-page-canvas")).toBeAttached();
});

test("an unknown song id redirects to the landing page", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));
  await page.goto("/play/bogus", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#landing-page-canvas")).toBeAttached();
  expect(pageErrors.map((e) => e.message).join("\n")).toBe("");
});
