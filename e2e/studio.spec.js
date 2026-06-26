const { test, expect } = require("@playwright/test");

test("/studio loads the sidebar and the default story", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/studio", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("link", { name: "Song Icons" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Loading Icon" })).toBeVisible();

  // default story (first in the registry) renders all song icons side by side
  await expect(page.locator("#custom-swamp-icon")).toBeAttached();
  await expect(page.locator("#custom-moonrise-icon")).toBeAttached();

  expect(pageErrors.map((e) => e.message).join("\n")).toHaveLength(0);
});

test("selecting a story navigates and renders it", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Loading Icon" }).click();
  await expect(page).toHaveURL(/\/studio\/loading$/);
  await expect(page.locator("#custom-loading-icon")).toBeAttached();
});

test("toggle button story renders the toggle", async ({ page }) => {
  await page.goto("/studio/toggle", { waitUntil: "domcontentloaded" });
  await expect(page.locator("button.toggle-button")).toBeVisible();
});

test("menu button story renders the radial menu", async ({ page }) => {
  await page.goto("/studio/menu", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".menu-button-parent")).toBeVisible();
});

test("icon gallery story renders the icon grid", async ({ page }) => {
  await page.goto("/studio/icons", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("icon-home", { exact: true })).toBeVisible();
});
