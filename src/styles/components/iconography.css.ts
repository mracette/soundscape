import { globalStyle, style } from "@vanilla-extract/css";
import { vh } from "../settings";

export const sharingLink = style({
  padding: vh(1),
});

globalStyle(`${sharingLink} img`, {
  width: vh(6),
  height: vh(6),
});

export const iconRow = style({
  width: "100%",
});

export const iconRowChild = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: vh(6),
  height: vh(6),
  padding: vh(1),
  selectors: {
    "&:first-child": {
      marginLeft: 0,
    },
    "&:last-child": {
      marginRight: 0,
    },
  },
});
