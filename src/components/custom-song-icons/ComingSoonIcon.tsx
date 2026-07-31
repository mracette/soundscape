import { rotatePoint, TAU, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";
import { heroGradientAt } from "./heroGradient";

const addPad = 0.8;

const animate = (
  context: CanvasRenderingContext2D,
  cycle: number,
  coords: CanvasCoordinates,
  hoverProgress: number
) => {
  const count = 3;
  const rows = 3;
  const rect = coords.getWidth() / 2.5;
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < count; i++) {
      const x = (1 - addPad) * -1 + ((1 - addPad) * 2 * (i + 0.5)) / count;
      const y = (1 - addPad) * -1 + ((1 - addPad) * 2 * (r + 0.5)) / rows;
      const mod = 1 - 2 * ((i + r) % 2);
      const rot = rotatePoint(x, y, 0, 0, 0 + mod * cycle + TAU);
      const cx = coords.nx(rot.x);
      const cy = coords.ny(rot.y)!;
      if (hoverProgress > 0) {
        context.strokeStyle = heroGradientAt(
          context,
          cx,
          cy,
          (rect / 2) * Math.SQRT2,
          hoverProgress
        );
      }
      context.beginPath();
      context.rect(cx - rect / 2, cy - rect / 2, rect, rect);
      context.stroke();
    }
  }
};

interface Props {
  name?: string;
  onSelect?: (id: string | null) => void;
}

export function ComingSoonIcon(props: Props) {
  return (
    <CustomSongIcon
      onSelect={props.onSelect}
      name={props.name}
      id="coming-soon-icon"
      animate={animate}
      listen={true}
    />
  );
}
