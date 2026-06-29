import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const BLENDER =
  process.env.BLENDER_BIN || "/Applications/Blender.app/Contents/MacOS/Blender";
const FIXTURE = resolve("public/blender-contract.glb");
const SCRIPT = resolve("tools/blender/tests/export_contract_fixture.py");
const HAS_BLENDER = existsSync(BLENDER);

test.describe("blender glTF export contract", () => {
  test.skip(!HAS_BLENDER, `Blender not found at ${BLENDER}`);

  test.beforeAll(() => {
    if (!HAS_BLENDER) return;
    execFileSync(BLENDER, ["--background", "--python", SCRIPT], {
      env: { ...process.env, SOUNDSCAPE_FIXTURE_OUT: FIXTURE },
      stdio: "inherit",
    });
    if (!existsSync(FIXTURE)) throw new Error("fixture not generated: " + FIXTURE);
  });

  test("Blender export carries bindings onto the mesh as an object", async ({ page }) => {
    await page.goto("/blender-contract.html", { waitUntil: "load" });
    await page.waitForFunction(() => window.__blenderContract?.ready === true);
    const r = await page.evaluate(() => window.__blenderContract);

    expect(r.error, r.error).toBeUndefined();
    // (a) nested object, not a JSON string
    expect(r.userDataType).toBe("[object Object]");
    // (b) on the mesh, not a parent Group
    expect(r.carrierIsMesh).toBe(true);
    // schema-valid for the Phase-2 runtime
    expect(r.valid, r.errors.join("; ")).toBe(true);
  });
});
