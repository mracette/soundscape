import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { boundedSine } from "bounded-sine";
import { rotatePoint, Vector2 } from "crco-utils";
import { memo, useContext, useMemo, useRef } from "react";
import { Group, Shape } from "three";
import { SongIcon } from "src/components/landing/icons/SongIcon";
import { ThreeCanvasCoordinatesContext } from "src/components/shared/ThreeCanvasCoordinates";

const LEAF_COUNT = 8;
const LEAF_PROPORTION = 1;
const PERIOD = 5;

/** World rotation for each item */
const OBJECT_ROTATIONS = new Array(LEAF_COUNT)
  .fill(0)
  .map((_, i) => (i * Math.PI * 2) / LEAF_COUNT);

const rotationCycle = boundedSine({
  period: PERIOD,
  yMin: -Math.PI * 2,
  yMax: 0,
  yStart: 0,
});

const scaleCycle = boundedSine({
  period: PERIOD / 2,
  yMin: 0,
  yMax: 1,
  yStart: 1,
});

interface Props {
  hovering: boolean;
}

const SwampIconInner = memo(({ hovering }: Props) => {
  const coords = useContext(ThreeCanvasCoordinatesContext);

  const groupRef = useRef<Group | null>(null);
  const accumulatedTimeRef = useRef(0);

  const width = coords.width(1 / 3.5);
  const height = width * LEAF_PROPORTION;
  const offset = new Vector2(width * LEAF_PROPORTION * 0.78, 0);
  const origin = new Vector2(coords.nx(0), coords.ny(0));

  const points = useMemo(() => {
    const p0 = new Vector2(coords.nx(0) - width / 2, coords.ny(0));
    const c0 = new Vector2(coords.nx(0), coords.ny(0) + height / 2);
    const p1 = new Vector2(coords.nx(0) + width / 2, coords.ny(0));
    const c1 = new Vector2(coords.nx(0), coords.ny(0) - height / 2);

    const shape = new Shape();
    shape.moveTo(p0.x, p0.y);
    shape.quadraticCurveTo(c0.x, c0.y, p1.x, p1.y);
    shape.quadraticCurveTo(c1.x, c1.y, p0.x, p0.y);

    return shape.getPoints();
  }, [coords, height, width]);

  useFrame((_, delta) => {
    if (!groupRef.current || !hovering) return;

    accumulatedTimeRef.current += delta;

    const rotation = rotationCycle(accumulatedTimeRef.current);
    const scale = scaleCycle(accumulatedTimeRef.current);

    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = OBJECT_ROTATIONS[i] + rotation;
      child.scale.y = scale;
    });
  });

  return (
    <>
      <group ref={groupRef}>
        {OBJECT_ROTATIONS.map((rotation) => {
          const position = rotatePoint(
            offset.x,
            offset.y,
            origin.x,
            origin.y,
            rotation
          );
          return (
            <Line
              key={String(rotation)}
              points={points}
              linewidth={2}
              color="white"
              position={[position[0], position[1], 0]}
              rotation={[0, 0, rotation]}
            />
          );
        })}
      </group>
    </>
  );
});

export const SwampIcon = memo(() => (
  <SongIcon id="swamp" IconComponent={SwampIconInner} />
));

SwampIconInner.displayName = "SwampIconInner";
SwampIcon.displayName = "SwampIcon";
