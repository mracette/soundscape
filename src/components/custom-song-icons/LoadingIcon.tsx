import { boundedSin, TAU, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";
import {
  loadingIcon,
  loadingIconMobile,
} from "../../styles/components/CustomSongIcons.css";

const SIZE_CLASSES = { base: loadingIcon, mobile: loadingIconMobile };

const period = 2;
const bsin = boundedSin(period, 0, 1, 0);
const gridSize = 16;

const animateLoading = (context: CanvasRenderingContext2D, cycle: number, coords: CanvasCoordinates) => {
  const r = coords.getHeight()! / 64;

  context.globalCompositeOperation = "source-over";

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const p = [
        -1 + (2 * (i + 0.5)) / gridSize,
        -1 + (2 * (j + 0.5)) / gridSize,
      ];

      context.beginPath();
      context.arc(
        coords.nx(p[0]),
        coords.ny(p[1])!,
        bsin(cycle - 1.75 * (i / gridSize) * (j / gridSize) * period) * r,
        0,
        TAU
      );
      context.fill();
    }
  }

  // Clip the grid to a disc: `destination-in` keeps only what the mask covers
  // and leaves the rest transparent, so the icon reads as a cluster of light on
  // the sky rather than a disc punched out of it. The mask fades at its rim
  // instead of ending hard, which would slice the dots it crosses.
  const cx = coords.nx(0);
  const cy = coords.ny(0)!;
  const radius = coords.getHeight()! / 2.5;
  const mask = context.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
  mask.addColorStop(0, "rgba(255, 255, 255, 1)");
  mask.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.globalCompositeOperation = "destination-in";
  context.fillStyle = mask;
  context.fillRect(
    coords.nx(-1),
    coords.ny(-1)!,
    coords.getWidth(),
    coords.getHeight()!
  );
};

interface Props {
  name?: string;
}

export function LoadingIcon(props: Props) {
  return (
    <CustomSongIcon
      name={props.name}
      id="custom-loading-icon"
      animate={animateLoading}
      sizeClasses={SIZE_CLASSES}
    />
  );
}
