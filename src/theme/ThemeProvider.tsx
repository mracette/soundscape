import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import { compiledSoundscapeTheme } from "src/theme/theme";

interface Props {
  children: ReactNode;
}

export const SoundscapeThemeProvider = ({ children }: Props) => {
  return (
    <ThemeProvider theme={compiledSoundscapeTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={(theme) => ({
          "body, html": {
            ...theme.mixins.fillAbsolute,
          },
        })}
      />
      {children}
    </ThemeProvider>
  );
};
