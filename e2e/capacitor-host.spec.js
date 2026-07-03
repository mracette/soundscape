import { test, expect } from "@playwright/test";

// GA must load on the public web, but NOT inside a native shell. We fake a
// native Capacitor host by injecting window.Capacitor before any app code runs
// (detectHost reads it at module load), then assert GA is absent.
const GA_SELECTOR = 'script[src*="googletagmanager.com/gtag"]';

test("web host loads Google Analytics", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#landing-page-canvas")).toBeAttached();
  expect(await page.locator(GA_SELECTOR).count()).toBeGreaterThan(0);
});

test("native (capacitor) host does not load Google Analytics", async ({ page }) => {
  await page.addInitScript(() => {
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "ios" };
  });
  await page.goto("/");
  await expect(page.locator("#landing-page-canvas")).toBeAttached();
  expect(await page.locator(GA_SELECTOR).count()).toBe(0);
});
