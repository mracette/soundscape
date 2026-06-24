import { boundedSin, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";
import "../../styles/components/LandingPage.css";

const bsin = boundedSin(2, 0, 1, -1.5);

const animate = (context: CanvasRenderingContext2D, cycle: number, coords: CanvasCoordinates) => {
  const panelWidth = coords.getWidth() / 8;
  const centerPoint = coords.nx(0) - panelWidth / 2;
  for (let i = 0; i < 5; i++) {
    const panelHeight = coords.getHeight()! * (0.6 - Math.abs(2 - i) * 0.1);
    context.beginPath();
    context.strokeRect(
      centerPoint - (2 - i) * panelWidth * bsin(cycle),
      coords.ny(-0.6 + Math.abs(2 - i) * 0.1)!,
      panelWidth,
      panelHeight
    );
  }
};

interface Props {
  name?: string;
  dispatch: (action: { type: string | null }) => void;
}

export function MorningsIcon(props: Props) {
  return (
    <CustomSongIcon
      dispatch={props.dispatch}
      name={props.name}
      id="custom-mornings-icon"
      animate={animate}
      listen={true}
    />
  );
}
