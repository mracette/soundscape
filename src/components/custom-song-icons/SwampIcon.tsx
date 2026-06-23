import { boundedSin, TAU, rotatePoint, CanvasCoordinates } from "../../utils/mathUtils";

// components
import { CustomSongIcon } from "./CustomSongIcon";

// styles
import "../../styles/components/LandingPage.css";

const bsin = boundedSin(2.5, 0, 1, -1.5);
const bsinRot = boundedSin(5, 0, 1, -1.5);

const animate = (context: CanvasRenderingContext2D, cycle: number, coords: CanvasCoordinates) => {
  const w = coords.getWidth();
  const h = coords.getHeight()!;
  const eyeWidth = w / 4;
  const eyeHeight = h / 15;
  const count = 8;

  for (let i = 0; i < count; i++) {
    const rot = TAU * (i / count);
    const rotAgain = TAU * bsinRot(cycle);
    const eyeStartX = coords.nx(-1 + 2 / 6);
    const eyeStartY = coords.ny(0)!;

    for (let j = 0; j < 2; j++) {
      const mod = j % 2 === 0 ? -1 : 1;
      const control = rotatePoint(
        eyeStartX + eyeWidth / 2,
        eyeStartY + bsin(cycle) * mod * eyeHeight * 2,
        coords.nx(0),
        coords.ny(0)!,
        rot
      );

      const point0 = rotatePoint(
        eyeStartX,
        eyeStartY,
        coords.nx(0),
        coords.ny(0)!,
        rot
      );

      const midPoint = rotatePoint(
        eyeStartX + eyeWidth / 2,
        eyeStartY,
        coords.nx(0),
        coords.ny(0)!,
        rot
      );

      const point1 = rotatePoint(
        eyeStartX + eyeWidth,
        eyeStartY,
        coords.nx(0),
        coords.ny(0)!,
        rot
      );

      const controlRot = rotatePoint(
        control.x,
        control.y,
        midPoint.x,
        midPoint.y,
        rotAgain
      );
      const point0Rot = rotatePoint(
        point0.x,
        point0.y,
        midPoint.x,
        midPoint.y,
        rotAgain
      );
      const point1Rot = rotatePoint(
        point1.x,
        point1.y,
        midPoint.x,
        midPoint.y,
        rotAgain
      );

      context.beginPath();
      context.moveTo(point0Rot.x, point0Rot.y);
      context.quadraticCurveTo(
        controlRot.x,
        controlRot.y,
        point1Rot.x,
        point1Rot.y
      );

      context.stroke();
    }
  }
};

interface Props {
  name?: string;
  dispatch: (action: { type: string | null }) => void;
}

export const SwampIcon = (props: Props) => {
  return (
    <CustomSongIcon
      isNew={false}
      dispatch={props.dispatch}
      name={props.name}
      id="custom-swamp-icon"
      animate={animate}
      listen={true}
    />
  );
};
