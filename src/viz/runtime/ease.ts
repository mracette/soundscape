import * as d3ease from "d3-ease";

/** Maps t in [0,1] to a shaped [0,1]. */
export type EaseFn = (t: number) => number;

const identity: EaseFn = (t) => t;

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Resolve a binding's `transform.ease` name to a d3-ease function.
 *
 * Names are the short d3-ease form without the `ease` prefix, lower-camel:
 * `"linear"`, `"quadInOut"`, `"cubicOut"`, … (mapped to d3's `easeLinear`,
 * `easeQuadInOut`, …). `undefined` yields a linear pass-through. An
 * unrecognized name is non-fatal: warn and fall back to linear so a typo in
 * authored scene data degrades gracefully instead of black-screening a scene.
 */
export function resolveEase(name?: string): EaseFn {
  if (name === undefined) return identity;
  const fn = (d3ease as Record<string, unknown>)["ease" + capitalize(name)];
  if (typeof fn === "function") return fn as EaseFn;
  console.warn(`[soundscape] unknown ease "${name}"; falling back to linear`);
  return identity;
}
