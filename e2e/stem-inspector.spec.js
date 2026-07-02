import { test, expect } from "@playwright/test";

// 1s mono 44100 wav: 0.5s LCG noise then silence (same fixture recipe as
// tools/blender/bake/test-bake-audio.mjs).
function fixtureWav() {
  const sampleRate = 44100;
  const n = sampleRate;
  const active = n / 2;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24); buf.writeUInt32LE(sampleRate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  let s = 1 >>> 0;
  for (let i = 0; i < active; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = (s / 0xffffffff) * 2 - 1;
    buf.writeInt16LE(Math.round(v < 0 ? v * 0x8000 : v * 0x7fff), 44 + i * 2);
  }
  return buf;
}

test("stem inspector lists, bakes, draws, and plays a stem", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.route("**/__stems", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify([{ song: "e2e", name: "tone.wav" }]) })
  );
  await page.route("**/audio/wav/e2e/tone.wav", (route) =>
    route.fulfill({ contentType: "audio/wav", body: fixtureWav() })
  );

  await page.goto("/stem-inspector.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.__stemInspector?.ready === true);

  // fixture stem is unknown to app-config -> unassigned bucket
  await expect(page.locator("#sidebar h4", { hasText: "unassigned" })).toBeVisible();
  await page.locator("#sidebar button", { hasText: "tone.wav" }).click();

  // both bakes ran: 1s at 30fps
  await page.waitForFunction(() => window.__stemInspector?.frames === 30);
  expect(await page.evaluate(() => window.__stemInspector.lastError)).toBeNull();

  // canvas actually drew something (waveform + curves -> non-blank pixels)
  const drawn = await page.evaluate(() => {
    const c = document.getElementById("canvas");
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let nonBlank = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) nonBlank++;
    return nonBlank;
  });
  expect(drawn).toBeGreaterThan(100);

  // playback advances the readout
  await page.locator("#play").click();
  await page.waitForTimeout(400);
  await expect(page.locator("#readout")).toContainText("t=0.");
  const t = await page.locator("#readout").textContent();
  expect(Number(t.match(/t=([\d.]+)s/)[1])).toBeGreaterThan(0);

  expect(pageErrors, pageErrors.map((e) => e.message).join("\n")).toHaveLength(0);
});
