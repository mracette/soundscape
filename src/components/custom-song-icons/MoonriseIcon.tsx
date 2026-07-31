import { TAU, rotatePoint, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";
import { heroGradientAt } from "./heroGradient";

const animate = (
  context: CanvasRenderingContext2D,
  cycle: number,
  coords: CanvasCoordinates,
  hoverProgress: number
) => {
  for (let i = 0; i < 5; i++) {
    const point = rotatePoint(0.2, 0, 0, 0, cycle + (TAU * i) / 5);
    const cx = coords.nx(point.x);
    const cy = coords.ny(point.y)!;
    const radius = coords.getWidth() / 4;
    if (hoverProgress > 0) {
      context.strokeStyle = heroGradientAt(context, cx, cy, radius, hoverProgress);
    }
    context.beginPath();
    context.arc(cx, cy, radius, 0, TAU);
    context.stroke();
  }
};

interface Props {
  name?: string;
  onSelect?: (id: string | null) => void;
}

export function MoonriseIcon(props: Props) {
  return (
    <CustomSongIcon
      onSelect={props.onSelect}
      name={props.name}
      id="custom-moonrise-icon"
      animate={animate}
      listen={true}
    />
  );
}
