import { Color, PaletteOptions } from "@mui/material";
import chroma from "chroma-js";

const BASE_GREY = chroma("rgb(31, 38, 47)").darken(0.3);
const BASE_WHITE = chroma("white");

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const BRIGHTNESS_AMOUNT = 4;

const grey: Partial<Color> = {};
const white: Partial<Color> = {};

for (const shade of SHADES) {
  grey[shade] = BASE_GREY.brighten(
    (900 - shade) / (900 / BRIGHTNESS_AMOUNT)
  ).hex();
  white[shade] = BASE_WHITE.alpha(shade / 1000).hex();
}

export const palette: PaletteOptions = {
  mode: "dark",
  grey,
  white,
  background: { default: grey[900], paper: grey[800] },
  gradients: {
    landing: ["#FEAC5E", "#C779D0", "#59e8f2"],
  },
  lullaby: {
    green1: "#49686A",
    green2: "#628675",
    green3: "#6D8F7D",
    green4: "#90AC85",
    deepTaupe: "#795663",
    salmonPink: "#EF959C",
    pinkLavendar: "#D0A5C0",
    paradisePink: "#EA526F",
    mikadoYellow: "#FFC800",
    melon: "#FAB3A9",
  },
};
