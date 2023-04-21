import { Color } from "@mui/material";
import "@mui/material/styles";
import "@mui/material/styles/createMixins";

declare module "@mui/material/styles/createMixins" {
  interface MixinsOptions {
    fillAbsolute: Record<string, string>;
  }
  interface Mixins {
    fillAbsolute: Record<string, string>;
  }
}

interface LullabyColors {
  green1: string;
  green2: string;
  green3: string;
  green4: string;
  deepTaupe: string;
  salmonPink: string;
  pinkLavendar: string;
  paradisePink: string;
  mikadoYellow: string;
  melon: string;
}

declare module "@mui/material/styles" {
  interface PaletteOptions {
    white: Partial<Color>;
    lullaby: LullabyColors;
    gradients: {
      landing: string[];
    };
  }

  interface Palette {
    white: Color;
    lullaby: LullabyColors;
    gradients: {
      landing: string[];
    };
  }
}
