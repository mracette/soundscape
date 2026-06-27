import { test, expect } from "@playwright/test";
import {
  gotoScene,
  getGroup,
  readPolyphony,
  readGain,
  premasterGain,
} from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await gotoScene(page, "swamp");
});

test("toggling a voice updates the group polyphony count", async ({ page }) => {
  const bass = getGroup(page, "bass");
  expect((await readPolyphony(bass)).cur).toBe(0);
  await bass.locator(".toggle-button").first().click();
  await expect.poll(async () => (await readPolyphony(bass)).cur).toBe(1);
  await bass.locator(".toggle-button").first().click();
  await expect.poll(async () => (await readPolyphony(bass)).cur).toBe(0);
});

test("polyphony cap overrides the oldest voice (poly=1 group)", async ({
  page,
}) => {
  const bass = getGroup(page, "bass"); // poly=1
  const btns = bass.locator(".toggle-button");
  await btns.nth(0).click();
  await expect.poll(async () => (await readPolyphony(bass)).cur).toBe(1);
  // Starting a second voice in a poly=1 group overrides the first; count stays 1.
  await btns.nth(1).click();
  await page.waitForTimeout(2000);
  expect((await readPolyphony(bass)).cur).toBe(1);
});

test("reset stops all active voices", async ({ page }) => {
  const bass = getGroup(page, "bass");
  const harmony = getGroup(page, "harmony");
  await bass.locator(".toggle-button").first().click();
  await harmony.locator(".toggle-button").first().click();
  await expect.poll(async () => (await readPolyphony(bass)).cur).toBe(1);
  await page.locator("#toggle-button-panel-reset").click();
  await expect.poll(async () => (await readPolyphony(bass)).cur).toBe(0);
  await expect.poll(async () => (await readPolyphony(harmony)).cur).toBe(0);
});

test("randomize activates at least one voice within polyphony limits", async ({
  page,
}) => {
  await page.locator("#toggle-button-panel-randomize").click();
  await page.waitForTimeout(2000);
  const groups = page.locator(".toggle-button-group");
  const n = await groups.count();
  let total = 0;
  for (let i = 0; i < n; i++) {
    const { cur, max } = await readPolyphony(groups.nth(i));
    total += cur;
    if (max !== -1) expect(cur).toBeLessThanOrEqual(max);
  }
  expect(total).toBeGreaterThan(0);
});

test("muting a group sets its gain to zero, then restores it", async ({
  page,
}) => {
  expect(await readGain(page, "swamp", "bass")).toBe(1);
  await getGroup(page, "bass").locator(".mute-button").click();
  await expect.poll(() => readGain(page, "swamp", "bass")).toBe(0);
  await getGroup(page, "bass").locator(".mute-button").click();
  await expect.poll(() => readGain(page, "swamp", "bass")).toBe(1);
});

test("soloing a group silences the others", async ({ page }) => {
  await getGroup(page, "bass").locator(".solo-button").click();
  await expect.poll(() => readGain(page, "swamp", "bass")).toBe(1);
  await expect.poll(() => readGain(page, "swamp", "harmony")).toBe(0);
  // Clearing solo restores the others.
  await getGroup(page, "bass").locator(".solo-button").click();
  await expect.poll(() => readGain(page, "swamp", "harmony")).toBe(1);
});

test("global mute sets premaster gain to zero, then restores it", async ({
  page,
}) => {
  expect(await premasterGain(page)).toBe(1);
  await page.locator("#toggle-button-panel-mute").click();
  await expect.poll(() => premasterGain(page)).toBe(0);
  await page.locator("#toggle-button-panel-mute").click();
  await expect.poll(() => premasterGain(page)).toBe(1);
});

test("background mode auto-activates voices over time", async ({ page }) => {
  test.slow(); // background mode is scheduled at 32 beats/bpm -> triple timeout
  await page.locator(".menu-button-child").nth(2).click(); // effects panel
  // The checkbox input has opacity:0/size:0; click the visible .slider.round span instead.
  await page.locator("#effects-panel .slider.round").first().click();
  // Wait generously for at least one scheduled auto-trigger.
  await expect
    .poll(
      async () => {
        const groups = page.locator(".toggle-button-group");
        const n = await groups.count();
        let total = 0;
        for (let i = 0; i < n; i++) total += (await readPolyphony(groups.nth(i))).cur;
        return total;
      },
      { timeout: 40_000 }
    )
    .toBeGreaterThan(0);
});
