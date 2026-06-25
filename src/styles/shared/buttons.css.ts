import { style } from "@vanilla-extract/css";
import { vh } from "../settings";

export const buttonWhite = style({
  fontSize: vh(1.75),
  backgroundColor: "rgba(255, 255, 255, 0)",
  borderStyle: "solid",
  borderColor: "white",
  color: "white",
  padding: vh(1),
  margin: "0 auto 0 auto",
  flexBasis: "auto",
  flexGrow: 1,
});

export const groupedButtons = style({
  flex: "1 1 auto",
  borderTopWidth: vh(0.2),
  borderBottomWidth: vh(0.2),
  borderLeftWidth: vh(0.1),
  borderRightWidth: vh(0.1),
  selectors: {
    "&:first-of-type": {
      borderLeftWidth: vh(0.2),
    },
    "&:last-of-type": {
      borderRightWidth: vh(0.2),
    },
  },
});
