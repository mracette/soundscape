import { clamp } from "../utils/mathUtils";

// The edge-avoidance margin (bounds) and step size (effectSize) were tuned on
// the full 1-100 range as 35 and 40; they scale with the actual range so a
// narrowed safe zone (e.g. the background-mode lp walk, 55-100) wanders the same
// way. With the fixed values, the middle "gentle wander" branch is unreachable
// in a narrow range and the walk just ratchets between the bounds.
//
// Lives in its own module (rather than EffectsPanel.tsx) so the walk math can be
// unit-tested without dragging the component's vanilla-extract styles into a
// node test environment.
export const chooseNewValue = (prev: number, min = 1, max = 100): number => {
  const range = max - min;
  const bounds = (35 / 99) * range;
  const effectSize = (40 / 99) * range;
  let newValue: number;
  if (prev < min + bounds) {
    newValue = prev + Math.random() * effectSize;
  } else if (prev > max - bounds) {
    newValue = prev - Math.random() * effectSize;
  } else {
    newValue = prev + (-0.5 + Math.random()) * effectSize;
  }
  return clamp(newValue, min, max);
};
