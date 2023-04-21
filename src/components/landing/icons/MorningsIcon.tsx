import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { boundedSine } from "bounded-sine";
import { Vector2 } from "crco-utils";
import { memo, useContext, useMemo, useRef } from "react";
import { Group, Shape } from "three";
import { SongIcon } from "src/components/landing/icons/SongIcon";
import { ThreeCanvasCoordinatesContext } from "src/components/shared/ThreeCanvasCoordinates";

const PANEL_COUNT = 5;
const PERIOD = 2;

/** Height scaling for each item */
const OBJECT_SCALING = new Array(PANEL_COUNT)
  .fill(0)
  .map((_, i) => 0.6 - Math.abs(2 - i) * 0.1);

const positionCycle = boundedSine({
  period: PERIOD,
  yMin: 0,
  yMax: 1,
  yStart: 1,
});

interface Props {
  hovering: boolean;
}

const MorningsIconInner = memo(({ hovering }: Props) => {
  const coords = useContext(ThreeCanvasCoordinatesContext);

  const groupRef = useRef<Group | null>(null);
  const accumulatedTimeRef = useRef(0);

  const height = coords.height(1.05);
  const width = height / 8;
  const origin = new Vector2(coords.nx(0), coords.ny(0));

  const points = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(origin.x - width / 2, origin.y - height / 2);
    shape.lineTo(origin.x + width / 2, origin.y - height / 2);
    shape.lineTo(origin.x + width / 2, origin.y + height / 2);
    shape.lineTo(origin.x - width / 2, origin.y + height / 2);
    shape.closePath();

    return shape.getPoints();
  }, [height, origin.x, origin.y, width]);

  useFrame((_, delta) => {
    if (!groupRef.current || !hovering) return;

    accumulatedTimeRef.current += delta;

    const positionFactor = positionCycle(accumulatedTimeRef.current);

    groupRef.current.children.forEach((child, i) => {
      child.position.x = origin.x - (2 - i) * width * positionFactor;
    });
  });

  return (
    <group ref={groupRef}>
      {OBJECT_SCALING.map((scale, i) => {
        return (
          <Line
            key={String(i)}
            points={points}
            position={[origin.x - (2 - i) * width, 0, 0]}
            scale={[1, scale, 1]}
            linewidth={2}
            color="white"
          />
        );
      })}
    </group>
  );
});

export const MorningsIcon = memo(() => (
  <SongIcon id="mornings" IconComponent={MorningsIconInner}></SongIcon>
));

MorningsIconInner.displayName = "MorningsIconInner";
MorningsIcon.displayName = "MorningsIcon";
