import type { BakedFrame } from "../../bake/bakeSignal";

export interface CurveToggles {
  volume: boolean;
  onset: boolean;
  buckets: boolean[];
}

const BUCKET_COLORS = ["#e6b422", "#7ecb62", "#4dc3c3", "#7f9ff2", "#b98ef0", "#ef8fd0", "#d98c5f", "#a8a8a8"];

/**
 * One layered frame: waveform peaks (gray), enabled signal curves as
 * time-aligned polylines (volume blue, onset red, buckets from a palette),
 * then the playhead. Curves plot 0..1 over the full canvas height; the
 * waveform is centered vertically. Shared x-axis is seconds.
 */
export function drawInspector(
  canvas: HTMLCanvasElement,
  peaks: { min: number; max: number }[],
  frames: BakedFrame[],
  toggles: CurveToggles,
  playheadSec: number,
  durationSec: number
): void {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "#44444c";
  ctx.beginPath();
  peaks.forEach((p, x) => {
    ctx.moveTo(x + 0.5, h / 2 - (p.max * h) / 2);
    ctx.lineTo(x + 0.5, h / 2 - (p.min * h) / 2);
  });
  ctx.stroke();

  const curve = (pick: (f: BakedFrame) => number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    frames.forEach((f, i) => {
      const x = ((i + 0.5) / frames.length) * w;
      const y = h - pick(f) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineWidth = 1;
  };
  if (frames.length > 0) {
    toggles.buckets.forEach((on, b) => {
      if (on) curve((f) => f.buckets[b] ?? 0, BUCKET_COLORS[b % BUCKET_COLORS.length]);
    });
    if (toggles.volume) curve((f) => f.volume, "#4da6ff");
    if (toggles.onset) curve((f) => f.onset, "#ff5d5d");
  }

  if (durationSec > 0) {
    const x = (playheadSec / durationSec) * w;
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
}
