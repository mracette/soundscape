import { lerp } from "../../utils/mathUtils";

import {
  Vector3,
  TextureLoader,
  BufferGeometry,
  ShaderMaterial,
  Points,
  Vector4,
  BufferAttribute,
  Camera,
  WebGLRenderer,
  Scene,
  Texture,
} from "three-legacy";

// chroma-js has no bundled types; all chroma calls are typed as any
import chroma from "chroma-js";

export const COLOR_SCALE = chroma
  .scale(["#FEAC5E", "#C779D0", "#59e8f2"])
  .mode("lrgb");

export const COLOR_SCALE_STEPS = COLOR_SCALE.colors(10, "hex");

const COUNT = 3000;
const SPEED = 0.01;
const V3 = new Vector3();

const getY = (lifecycle: number): number => Math.pow(lifecycle, 2.75);

const positions: number[] = [];
const lifecycles: number[] = [];
const colors: number[] = [];

for (let i = 0; i < COUNT; i++) {
  V3.set(Math.random(), Math.random(), Math.random());
  const lifeCycle = Math.random();
  lifecycles.push(lifeCycle);
  positions.push(V3.x, getY(lifeCycle), V3.z);
  // chroma(...).gl() returns [r, g, b, a] as number[]; typed any due to missing chroma types
  const chroma = COLOR_SCALE(Math.random()).gl();
  colors.push(chroma[0], chroma[1], chroma[2]);
}

export class LandingPageParticles {
  scene: Scene;
  camera: Camera;
  renderer: WebGLRenderer;
  loader: TextureLoader;
  object: Points | undefined;

  constructor(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.loader = new TextureLoader();

    const viewport = new Vector4();

    this.renderer.getViewport(viewport);

    const planeDimensions = new Vector3(
      1.05 * viewport.z,
      1.05 * viewport.w,
      1
    );

    const geometry = new BufferGeometry();

    geometry.attributes.position = new BufferAttribute(
      new Float32Array(positions),
      3
    );

    geometry.attributes.lifecycle = new BufferAttribute(
      new Float32Array(lifecycles),
      1
    );

    geometry.attributes.color = new BufferAttribute(
      new Float32Array(colors),
      3
    );

    this.loadTexture()
      .then((texture) => {
        const material = new ShaderMaterial({
          depthTest: false,
          transparent: true,
          uniforms: {
            uMap: { value: texture },
            uSize: { value: 10 * this.renderer.getPixelRatio() },
          },
          defines: {
            USE_COLOR: "",
          },
          fragmentShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          varying vec3 vColor;

          uniform sampler2D uMap;

          void main()	{

              float opacity = .6 * (1. - vPosition.y);

              vec4 texColor = texture2D( uMap, gl_PointCoord );

              gl_FragColor = vec4 ( vColor.xyz, texColor.w * opacity );

          }
          `,
          vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          varying vec3 vColor;

          uniform float uSize;

          void main()	{

              vPosition = position;
              vNormal = normal;
              vColor = color;

              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
              gl_PointSize = uSize * mix(1., .5, position.z);

          }
          `,
        });
        this.object = new Points(geometry, material);
        this.object.scale.copy(planeDimensions);
        this.object.position.copy(planeDimensions.clone().multiplyScalar(-0.5));
        this.scene.add(this.object);
      })
      .catch(console.error);
  }

  update = (delta: number): void => {
    if (!this.object) return; // Wait for texture load

    const geom = this.object.geometry as BufferGeometry;
    geom.setDrawRange(0, Math.min(window.innerWidth, COUNT));

    const position = geom.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      const zFactor = lerp(position.getZ(i), 0.5, 1);
      const lifecycleNext = lifecycles[i] + delta * SPEED * (1 / zFactor);
      lifecycles[i] = lifecycleNext % 1;
      position.setY(i, getY(lifecycles[i]));
    }
    (geom.attributes.position as BufferAttribute).needsUpdate = true;
  };

  loadTexture = (): Promise<Texture> => {
    return new Promise((resolve, reject) => {
      this.loader.load(
        `${import.meta.env.BASE_URL}img/particle1.png`,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  };
}
