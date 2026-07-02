// Cap the render loop to 60fps. On high-refresh displays (120Hz+) RAF would
// otherwise render 2x as often — pure heat/battery for an ambient visualizer,
// with no visible benefit (motion is time-based, not per-frame).
const TARGET_FPS = 60;
export const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
// Jitter margin: render when within this of the target interval. Without it, a
// true 60Hz display (frames arriving a hair under 16.67ms) gets halved to 30fps;
// the margin sits safely between a 120Hz frame (8.33ms) and a 60Hz one (16.67ms),
// so 60Hz renders every frame and 120Hz renders every other = 60.
export const FRAME_TOLERANCE_MS = 4;

/**
 * Frame-rate cap decision for `SceneManager.animate`, kept free of three.js so
 * it can be unit-tested: given the current RAF timestamp and the accumulator of
 * the last rendered frame, decide whether to render this tick and return the
 * advanced accumulator.
 *
 * Skips the tick unless ~1/60s (minus the jitter margin) has elapsed since the
 * last rendered frame. On a render, the accumulator advances by the exact
 * interval rather than snapping to `now`, so the remainder carries over —
 * snapping quantizes the rate to refresh/ceil(interval/period), e.g. 90Hz→45fps,
 * 144Hz→72fps, 165Hz→55fps. Drift clamp: after a stall (hidden tab, long GC
 * pause) the accumulator sits far in the past and would render every tick to
 * "catch up" — resync it to `now`.
 */
export const frameGate = (
  now: number,
  lastFrameTime: number
): { render: boolean; lastFrameTime: number } => {
  if (now - lastFrameTime < FRAME_INTERVAL_MS - FRAME_TOLERANCE_MS) {
    return { render: false, lastFrameTime };
  }
  let next = lastFrameTime + FRAME_INTERVAL_MS;
  if (now - next > 2 * FRAME_INTERVAL_MS) next = now;
  return { render: true, lastFrameTime: next };
};
