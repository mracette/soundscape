import { TAU, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";

const animate = (context: CanvasRenderingContext2D, cycle: number, coords: CanvasCoordinates) => {
  for (let i = 1; i <= 3; i++) {
    context.beginPath();
    context.arc(
      coords.nx(0),
      coords.ny(0)!,
      (coords.getWidth() / 8) * i,
      cycle,
      cycle + TAU * 0.75
    );
    context.stroke();
  }
};

interface Props {
  name?: string;
  onSelect: (id: string | null) => void;
}

export function PreludeIcon(props: Props) {
  return (
    <CustomSongIcon
      onSelect={props.onSelect}
      name={props.name}
      id="custom-prelude-icon"
      animate={animate}
      listen={true}
    />
  );
}
