import { test, expect, _electron as electron } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync, existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "apps", "desktop", "dist");

// Resolves the packaged macOS binary, asserting (with friendly messages) that
// the package exists. Called inside each test so a missing dist/ surfaces as a
// clear assertion failure rather than a module-load crash.
function appBinaryPath() {
  expect(
    existsSync(distDir),
    `dist/ not found at ${distDir} — run \`pnpm --filter @soundscape/desktop package:dir\` first`
  ).toBe(true);
  const macDir = readdirSync(distDir).find((d) => d.startsWith("mac"));
  expect(macDir, `no mac* build dir under ${distDir}`).toBeTruthy();
  const appBinary = join(distDir, macDir, "Soundscape.app", "Contents", "MacOS", "Soundscape");
  expect(existsSync(appBinary), `packaged app not found at ${appBinary}`).toBe(true);
  return appBinary;
}

test("packaged app boots offline over app:// and renders a scene", async () => {
  const app = await electron.launch({ executablePath: appBinaryPath() });
  const page = await app.firstWindow();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e));

  // Landing canvas mounts from the bundled renderer over app://local.
  await expect(page.locator("#landing-page-canvas")).toBeAttached({
    timeout: 30_000,
  });

  // Scene route loads bundled models/audio offline (SPA fallback serves index.html).
  await page.goto("app://local/play/swamp");
  await expect(page.locator("#canvas-viz")).toBeAttached({ timeout: 30_000 });
  await page.waitForTimeout(3_000);
  expect(errors, errors.map((e) => e.message).join("\n")).toHaveLength(0);

  // App-shell hardening active on the native host.
  const prevented = await page.evaluate(() => {
    const e = new MouseEvent("contextmenu", { cancelable: true });
    return !document.dispatchEvent(e);
  });
  expect(prevented).toBe(true);

  await app.close();
});

test("info page back button returns to landing (native host)", async () => {
  const app = await electron.launch({ executablePath: appBinaryPath() });
  const page = await app.firstWindow();

  await page.goto("app://local/info");

  // The back control is gated to native hosts (isWeb === false in Electron),
  // since the web relies on the browser's own back navigation.
  const back = page.getByRole("button", { name: /back/i });
  await expect(back).toBeVisible({ timeout: 15_000 });

  await back.click();

  // The song-selection panel only renders at "/", so its presence confirms the
  // button navigated home rather than leaving us stranded on /info.
  await expect(page.locator("#song-selection-panel")).toBeVisible({
    timeout: 15_000,
  });

  await app.close();
});
