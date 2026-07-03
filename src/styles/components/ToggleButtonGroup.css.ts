import { style } from "@vanilla-extract/css";
import { textPrimary, vh } from "../settings";

const soloMuteBase = style({
  fontSize: vh(1.5),
  color: textPrimary,
  padding: 0,
  height: vh(3.25),
  width: vh(3.25),
  borderColor: textPrimary,
  borderStyle: "solid",
  backgroundColor: "transparent",
});

export const soloButton = style([
  soloMuteBase,
  {
    marginLeft: vh(1),
    borderWidth: ".2rem .1rem .2rem .2rem",
  },
]);

export const muteButton = style([
  soloMuteBase,
  {
    borderWidth: ".2rem .2rem .2rem .1rem",
  },
]);

export const toggleButtonGroup = style({
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
});

export const toggleButtons = style({
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
});
