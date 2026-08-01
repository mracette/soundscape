import { test, expect } from "@playwright/test";

// sRGB #3366cc — the HelloScene cube color. With ColorManagement on and
// NoToneMapping + sRGB output, an unlit sRGB color round-trips to the same
// framebuffer bytes, so the center pixel must read back as ~#3366cc.
const EXPECTED = [0x33, 0x66, 0xcc];
const TOLERANCE = 4; // 8-bit sRGB<->linear round-trip quantization

test("blender-hello harness renders the parity cube with correct sRGB color", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/blender-hello.html", { waitUntil: "load" });
  await expect(page.locator("#blender-hello-canvas")).toBeAttached();
  await page.waitForFunction(() => !!window.__blenderHello);

  const pixel = await page.evaluate(() => window.__blenderHello.centerPixel);

  for (let i = 0; i < 3; i++) {
    expect(
      Math.abs(pixel[i] - EXPECTED[i]),
      `channel ${i}: got ${pixel[i]}, expected ~${EXPECTED[i]}`
    ).toBeLessThanOrEqual(TOLERANCE);
  }

  expect(
    pageErrors,
    pageErrors.map((e) => e.message).join("\n")
  ).toHaveLength(0);
});
