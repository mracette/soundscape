import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { rotatePoint, TAU } from "crco-utils";
import { memo, useContext, useMemo, useRef } from "react";
import { Group, Shape } from "three";
import { SongIcon } from "src/components/landing/icons/SongIcon";
import { ThreeCanvasCoordinatesContext } from "src/components/shared/ThreeCanvasCoordinates";

const COUNT = 5;

const INITIAL_POSITIONS = new Array(COUNT)
  .fill(0)
  .map((_, i) => rotatePoint(0.1, 0, 0, 0, (TAU * i) / COUNT));

interface Props {
  hovering: boolean;
}

const MoonriseIconInner = memo(({ hovering }: Props) => {
  const coords = useContext(ThreeCanvasCoordinatesContext);

  const groupRef = useRef<Group | null>(null);
  const accumulatedTimeRef = useRef(0);

  const width = coords.width(1 / 4);

  const points = useMemo(() => {
    const shape = new Shape();
    shape.arc(0, 0, width, 0, TAU, false);
    return shape.getPoints(128);
  }, [width]);

  useFrame((_, delta) => {
    if (!groupRef.current || !hovering) return;
    accumulatedTimeRef.current += delta;
    groupRef.current.rotation.z = -accumulatedTimeRef.current;
  });

  return (
    <group ref={groupRef}>
      {INITIAL_POSITIONS.map((position, i) => {
        return (
          <Line
            key={String(i)}
            points={points}
            position={[coords.width(position[0]), coords.width(position[1]), 0]}
            linewidth={2}
            color="white"
          />
        );
      })}
    </group>
  );
});

export const MoonriseIcon = memo(() => (
  <SongIcon IconComponent={MoonriseIconInner} id="moonrise" />
));

MoonriseIconInner.displayName = "MoonriseIconInner";
MoonriseIcon.displayName = "MoonriseIcon";
