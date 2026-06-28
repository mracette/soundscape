import { test, expect, _electron as electron } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readdirSync, existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "apps", "desktop", "dist");
const macDir = readdirSync(distDir).find((d) => d.startsWith("mac"));
const appBinary = join(
  distDir,
  macDir,
  "Soundscape.app",
  "Contents",
  "MacOS",
  "Soundscape"
);

test("packaged app boots offline over app:// and renders a scene", async () => {
  expect(
    existsSync(appBinary),
    `packaged app not found at ${appBinary} — run package:dir first`
  ).toBe(true);

  const app = await electron.launch({ executablePath: appBinary });
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
