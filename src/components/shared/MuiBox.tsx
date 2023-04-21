import { Box, BoxProps } from "@mui/material";
import { forwardRef } from "react";

export const MuiBox = forwardRef((props: BoxProps, ref) => {
  // @ts-ignore
  return <Box ref={ref} {...props} />;
});

MuiBox.displayName = "Box";
