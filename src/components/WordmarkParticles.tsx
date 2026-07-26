import { useRef, useEffect } from "react";

import { Canvas } from "./canvas/Canvas";
import { landingPageWordmarkParticles } from "../styles/components/LandingPage.css";

/** Where the sigil sits in the wordmark artwork, as a fraction of its box. */
const SIGIL_X = 0.549;
const SIGIL_TOP = 0.1;
const SIGIL_BOTTOM = 0.9;

const COUNT = 60;
/** Mote radii are quoted against this box width and scale with it. */
const SIZE_BASIS = 600;
const RISE = 0.05; // fraction of the box climbed per second
const LIFETIME = [3.5, 8.5];

interface Mote {
  x: number;
  y: number;
  drift: number;
  rise: number;
  size: number;
  age: number;
  ttl: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Seeds a mote just off the sigil, biased towards its middle. */
const spawn = (mote: Mote, stagger?: boolean) => {
  const along = (Math.random() + Math.random()) / 2;
  mote.x = SIGIL_X + (Math.random() - 0.5) * 0.06;
  mote.y = lerp(SIGIL_BOTTOM, SIGIL_TOP, along);
  mote.drift = (Math.random() - 0.5) * 0.05;
  mote.rise = RISE * lerp(0.5, 1.5, Math.random());
  mote.size = lerp(0.9, 3.2, Math.random() ** 2);
  mote.ttl = lerp(LIFETIME[0], LIFETIME[1], Math.random());
  // staggered on first fill, so the field does not pulse in unison
  mote.age = stagger ? Math.random() * mote.ttl : 0;
};

export const WordmarkParticles = () => {
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => () => cancelAnimationFrame(frameRef.current!), []);

  const start = (canvas: HTMLCanvasElement) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motes: Mote[] = Array.from({ length: COUNT }, () => {
      const mote = {} as Mote;
      spawn(mote, true);
      return mote;
    });

    let last = performance.now();

    const frame = (now: number) => {
      // clamped so a backgrounded tab does not resume with every mote expired
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "#ffffff";

      for (const mote of motes) {
        mote.age += delta;
        if (mote.age >= mote.ttl) spawn(mote);

        mote.y -= mote.rise * delta;
        mote.x += mote.drift * delta;

        const life = mote.age / mote.ttl;
        // fade in over the first fifth, out over the last half
        const alpha =
          Math.min(life / 0.2, 1) * Math.min((1 - life) / 0.5, 1) * 0.85;

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(
          mote.x * width,
          mote.y * height,
          mote.size * (width / SIZE_BASIS),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(frame);
    };

    cancelAnimationFrame(frameRef.current!);
    frameRef.current = requestAnimationFrame(frame);
  };

  return (
    <Canvas
      className={landingPageWordmarkParticles}
      onLoad={start}
      onResize={start}
    />
  );
};
