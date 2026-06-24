import { rotatePoint, TAU, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";
import "../../styles/components/LandingPage.css";

const addPad = 0.8;

const animate = (context: CanvasRenderingContext2D, cycle: number, coords: CanvasCoordinates) => {
  const count = 3;
  const rows = 3;
  const rect = coords.getWidth() / 2.5;
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < count; i++) {
      const x = (1 - addPad) * -1 + ((1 - addPad) * 2 * (i + 0.5)) / count;
      const y = (1 - addPad) * -1 + ((1 - addPad) * 2 * (r + 0.5)) / rows;
      const mod = 1 - 2 * ((i + r) % 2);
      const rot = rotatePoint(x, y, 0, 0, 0 + mod * cycle + TAU);
      context.beginPath();
      context.rect(
        coords.nx(rot.x) - rect / 2,
        coords.ny(rot.y)! - rect / 2,
        rect,
        rect
      );
      context.stroke();
    }
  }
};

interface Props {
  name?: string;
  dispatch: (action: { type: string | null }) => void;
}

export function ComingSoonIcon(props: Props) {
  return (
    <CustomSongIcon
      dispatch={props.dispatch}
      name={props.name}
      id="coming-soon-icon"
      animate={animate}
      listen={true}
    />
  );
}
