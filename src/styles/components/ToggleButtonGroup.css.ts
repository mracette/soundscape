import { style } from "@vanilla-extract/css";
import { vh } from "../settings";

const soloMuteBase = style({
  fontSize: vh(1.5),
  color: "white",
  padding: 0,
  height: vh(3.25),
  width: vh(3.25),
  borderColor: "white",
  borderStyle: "solid",
  backgroundColor: "rgba(255, 255, 255, 0)",
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
