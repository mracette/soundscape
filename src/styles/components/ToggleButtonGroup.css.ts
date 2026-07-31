import { style } from "@vanilla-extract/css";
import { glassLight, radii, textPrimary, typeRamp, vh } from "../settings";
import { glassControl, glassHover } from "../shared/glass.css";

const soloMuteBase = style([
  glassControl,
  glassHover,
  {
    fontSize: typeRamp.panelCaption.fontSize,
    fontWeight: typeRamp.panelCaption.fontWeight,
    color: textPrimary,
    padding: 0,
    height: vh(3.25),
    width: vh(3.25),
    border: "none",
    backgroundColor: glassLight.tint,
    cursor: "pointer",
  },
]);

export const soloButton = style([
  soloMuteBase,
  {
    marginLeft: vh(1),
    borderRadius: `${radii.control} 0 0 ${radii.control}`,
  },
]);

export const muteButton = style([
  soloMuteBase,
  {
    borderRadius: `0 ${radii.control} ${radii.control} 0`,
  },
]);

export const groupHeaderSpacer = style({
  height: vh(5.5),
  flex: "1 1 0",
});

export const toggleButtonGroup = style({
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
  paddingBottom: vh(1.2),
  selectors: {
    "&:last-child": { paddingBottom: 0 },
  },
});

export const toggleButtons = style({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
});
