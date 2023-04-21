/// <reference path="./theme.d.ts" />

import { createTheme } from "@mui/material/styles";
import { palette } from "src/theme/palette";

export const compiledSoundscapeTheme = createTheme({
  palette,
  typography: {
    fontSize: 16,
    allVariants: {
      // ...quicksand.style,
    },
  },
  mixins: {
    fillAbsolute: {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
    },
  },
});
