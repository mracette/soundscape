import chroma from "chroma-js";
import { compiledSoundscapeTheme } from "src/theme/theme";

export const scale = chroma
  .scale(compiledSoundscapeTheme.palette.gradients.landing)
  .mode("lrgb");
export const steps = scale.colors(10);
export const css = `linear-gradient(30deg, ${steps.join(", ")})`;
