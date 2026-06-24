import { TAU, rotatePoint, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";
import "../../styles/components/LandingPage.css";

const animate = (context: CanvasRenderingContext2D, cycle: number, coords: CanvasCoordinates) => {
  for (let i = 0; i < 5; i++) {
    context.beginPath();
    context.arc(
      coords.nx(rotatePoint(0.2, 0, 0, 0, cycle + (TAU * i) / 5).x),
      coords.ny(rotatePoint(0.2, 0, 0, 0, cycle + (TAU * i) / 5).y)!,
      coords.getWidth() / 4,
      0,
      TAU
    );
    context.stroke();
  }
};

interface Props {
  name?: string;
  dispatch: (action: { type: string | null }) => void;
}

export function MoonriseIcon(props: Props) {
  return (
    <CustomSongIcon
      dispatch={props.dispatch}
      name={props.name}
      id="custom-moonrise-icon"
      animate={animate}
      listen={true}
    />
  );
}
