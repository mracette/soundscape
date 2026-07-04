import { boundedSin, CanvasCoordinates } from "../../utils/mathUtils";

import { CustomSongIcon } from "./CustomSongIcon";
import { heroGradientAt } from "./heroGradient";

const bsin = boundedSin(2, 0, 1, -1.5);

const animate = (
  context: CanvasRenderingContext2D,
  cycle: number,
  coords: CanvasCoordinates,
  hoverProgress: number
) => {
  const panelWidth = coords.getWidth() / 8;
  const centerPoint = coords.nx(0) - panelWidth / 2;
  for (let i = 0; i < 5; i++) {
    const panelHeight = coords.getHeight()! * (0.6 - Math.abs(2 - i) * 0.1);
    const x = centerPoint - (2 - i) * panelWidth * bsin(cycle);
    const y = coords.ny(-0.6 + Math.abs(2 - i) * 0.1)!;
    if (hoverProgress > 0) {
      context.strokeStyle = heroGradientAt(
        context,
        x + panelWidth / 2,
        y + panelHeight / 2,
        Math.hypot(panelWidth, panelHeight) / 2,
        hoverProgress
      );
    }
    context.beginPath();
    context.strokeRect(x, y, panelWidth, panelHeight);
  }
};

interface Props {
  name?: string;
  onSelect?: (id: string | null) => void;
}

export function MorningsIcon(props: Props) {
  return (
    <CustomSongIcon
      onSelect={props.onSelect}
      name={props.name}
      id="custom-mornings-icon"
      animate={animate}
      listen={true}
    />
  );
}
