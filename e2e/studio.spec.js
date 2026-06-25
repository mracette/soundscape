const { test, expect } = require("@playwright/test");

test("/studio loads the sidebar and the default story", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/studio", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("link", { name: "Swamp Icon" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Loading Icon" })).toBeVisible();

  // default story (first in the registry) renders on the stage
  await expect(page.locator("#custom-swamp-icon")).toBeAttached();

  expect(pageErrors.map((e) => e.message).join("\n")).toHaveLength(0);
});

test("selecting a story navigates and renders it", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Loading Icon" }).click();
  await expect(page).toHaveURL(/\/studio\/loading$/);
  await expect(page.locator("#custom-loading-icon")).toBeAttached();
});
