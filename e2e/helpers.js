const { expect } = require("@playwright/test");

const SONGS = ["swamp", "mornings", "moonrise"];

// Patch getContext before app code runs so we can count WebGL context
// acquisitions per canvas. A scene re-init builds a second WebGLRenderer on the
// same canvas -> a second webgl getContext call -> count > 1.
async function installWebglCounter(page) {
  await page.addInitScript(() => {
    window.__webglContexts = {};
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      const id = this.id || "(no-id)";
      (window.__webglContexts[id] = window.__webglContexts[id] || []).push(type);
      return orig.call(this, type, ...args);
    };
  });
}

async function webglContextCount(page, canvasId) {
  return page.evaluate((id) => {
    const types = (window.__webglContexts && window.__webglContexts[id]) || [];
    return types.filter((t) => /webgl/i.test(String(t))).length;
  }, canvasId);
}

// Navigate to a play route and wait until the scene canvas is attached and the
// loading overlay is gone.
async function gotoScene(page, song) {
  await page.goto(`/play/${song}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#canvas-viz")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator("#loading-screen")).toHaveCount(0, {
    timeout: 30_000,
  });
}

function getGroup(page, name) {
  return page
    .locator(".toggle-button-group")
    .filter({ has: page.locator("h3", { hasText: name }) });
}

// Parse "<name> (<cur> / <max>)" -> { cur, max }.
async function readPolyphony(groupLocator) {
  const text = (await groupLocator.locator("h3").textContent()) || "";
  const m = text.match(/\((\d+)\s*\/\s*(-?\d+)\)/);
  return m ? { cur: Number(m[1]), max: Number(m[2]) } : { cur: NaN, max: NaN };
}

async function readStore(page) {
  return page.evaluate(() => window.__soundscape.store());
}

async function readGain(page, songId, groupName) {
  return page.evaluate(
    ([s, g]) => window.__soundscape.gain(s, g),
    [songId, groupName]
  );
}

async function premasterGain(page) {
  return page.evaluate(() => window.__soundscape.premasterGain());
}

module.exports = {
  SONGS,
  installWebglCounter,
  webglContextCount,
  gotoScene,
  getGroup,
  readPolyphony,
  readStore,
  readGain,
  premasterGain,
};
