import { useTheme } from "@mui/material";
import { useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { lerp, random } from "crco-utils";
import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { Points, Vector3, UniformsLib, Color, BufferAttribute } from "three";
import Fragment from "./materials/LandingPage.frag";
import Vertex from "./materials/LandingPage.vert";
import { scale } from "src/components/landing/gradient";
import { isOrthographicCamera } from "src/utils/predicates";

const COUNT = 1000;
const SPEED = 0.01;
const V3 = new Vector3();

const getY = (lifecycle: number) => Math.pow(lifecycle, 2.75);

const positions: number[] = [];
const lifecycles: number[] = [];
const colors: number[] = [];

for (let i = 0; i < COUNT; i++) {
  V3.set(random(0, 1), random(0, 1), random(0, 1));
  const lifeCycle = Math.random();
  lifecycles.push(lifeCycle);
  positions.push(V3.x, getY(lifeCycle), V3.z);
  const chroma = scale(Math.random()).gl();
  colors.push(chroma[0], chroma[1], chroma[2]);
}

const LandingPageSceneInner = memo(() => {
  const pointsRef = useRef<Points>(null);

  const { camera, size } = useThree();
  const particleTexture = useTexture("/particle1.png");

  if (!isOrthographicCamera(camera)) {
    throw new Error("Expected OrthographicCamera");
  }

  const planeDimensions = new Vector3(
    1.05 * (camera.right - camera.left),
    1.05 * (camera.top - camera.bottom),
    0
  );

  const uniforms = useMemo(() => {
    return {
      ...UniformsLib.points,
      map: { value: particleTexture },
      diffuse: { value: new Color(0x00ff00).toArray() },
    };
  }, [particleTexture]);

  useLayoutEffect(() => {
    uniforms.size.value = size.height / 75;
  }, [planeDimensions.y, size.height, uniforms]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const position = pointsRef.current.geometry.attributes
      .position as BufferAttribute;

    for (let i = 0; i < COUNT; i++) {
      const zFactor = lerp(position.getZ(i), 0.5, 1);

      const lifecycleNext = lifecycles[i] + delta * SPEED * (1 / zFactor);
      lifecycles[i] = lifecycleNext % 1;

      position.setY(i, getY(lifecycles[i]));
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position-z={-1}>
      <points
        ref={pointsRef}
        scale={planeDimensions}
        position={planeDimensions.clone().multiplyScalar(-0.5)}
      >
        <shaderMaterial
          fragmentShader={Fragment}
          vertexShader={Vertex}
          uniforms={uniforms}
          transparent
          depthTest={false}
          vertexColors
        />
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <float32BufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
          <float32BufferAttribute
            attach="attributes-lifecyle"
            args={[lifecycles, 1]}
          />
        </bufferGeometry>
      </points>
    </group>
  );
});

export const LandingPageScene = memo(() => {
  const theme = useTheme();
  return (
    <Canvas orthographic style={{ ...theme.mixins.fillAbsolute, zIndex: -1 }}>
      <LandingPageSceneInner />
    </Canvas>
  );
});

LandingPageScene.displayName = "LandingPageScene";
LandingPageSceneInner.displayName = "LandingPageSceneInner";
