import { lerp, TAU } from "../../utils/mathUtils";

import {
  Vector3,
  BufferGeometry,
  ShaderMaterial,
  Points,
  Vector4,
  BufferAttribute,
  Camera,
  WebGLRenderer,
  Scene,
  AdditiveBlending,
} from "three-legacy";

// chroma-js has no bundled types; all chroma calls are typed as any
import chroma from "chroma-js";

import { hotBlue, moonYellow } from "../../styles/settings";

// Starry-night star temperatures: warm moon-yellow through white to cool blue.
export const COLOR_SCALE = chroma
  .scale([moonYellow, "#ffffff", hotBlue])
  .mode("lrgb");

/**
 * Shared star sprite, computed from gl_PointCoord instead of a texture: a
 * sharp bright core with a faint halo so points read as light sources
 * (stars) rather than soft ember blobs. Returns alpha in [0, 1].
 */
export const STAR_SPRITE_GLSL = `
float starSpriteAlpha(vec2 pointCoord) {
    float d = length(pointCoord - .5) * 2.;
    float core = smoothstep(.4, .05, d);
    float halo = .15 * smoothstep(1., .3, d);
    return core + halo;
}
`;

/**
 * Shared horizon fade: sky elements sink into the horizon fog near the
 * bottom of the viewport (normalizedY = 0) and reach full brightness in the
 * upper sky. Used by the star field and the constellations so both obey the
 * same atmosphere.
 */
export const HORIZON_FADE_GLSL = `
float horizonFade(float normalizedY) {
    return mix(.02, 1., smoothstep(.12, .65, normalizedY));
}
`;

const COUNT = 3000;
const SPEED = 0.004;
const V3 = new Vector3();

// linear: stars spread evenly across the sky rather than pooling low
const getY = (lifecycle: number): number => lifecycle;

export class LandingPageParticles {
  scene: Scene;
  camera: Camera;
  renderer: WebGLRenderer;
  object: Points;
  private time = 0;
  private aspect = 1;
  // per-star drift state, mutated every frame in update(); instance-owned so
  // a remount starts from the same seed as its position attribute
  private lifecycles: number[] = [];
  private xOrigins: number[] = [];

  constructor(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    const positions: number[] = [];
    const colors: number[] = [];
    const magnitudes: number[] = [];
    const twinkles: number[] = [];

    for (let i = 0; i < COUNT; i++) {
      V3.set(Math.random(), Math.random(), Math.random());
      const lifeCycle = Math.random();
      this.lifecycles.push(lifeCycle);
      this.xOrigins.push(V3.x);
      positions.push(V3.x, getY(lifeCycle), V3.z);
      // pow skews the field dim: most stars are small and faint, a few bright
      magnitudes.push(Math.pow(Math.random(), 2.5));
      // per-star twinkle phase and rate, so shimmer is unsynchronized
      twinkles.push(Math.random() * TAU, lerp(0.5, 2.5, Math.random()));
      // sqrt biases sampling toward the white/blue end of the scale, leaving
      // moonYellow as the occasional warm star rather than the field default
      // chroma(...).gl() returns [r, g, b, a] as number[]; typed any due to missing chroma types
      const chroma = COLOR_SCALE(Math.sqrt(Math.random())).gl();
      colors.push(chroma[0], chroma[1], chroma[2]);
    }

    const geometry = new BufferGeometry();

    geometry.attributes.position = new BufferAttribute(
      new Float32Array(positions),
      3
    );

    geometry.attributes.lifecycle = new BufferAttribute(
      new Float32Array(this.lifecycles),
      1
    );

    geometry.attributes.color = new BufferAttribute(
      new Float32Array(colors),
      3
    );

    geometry.attributes.aMagnitude = new BufferAttribute(
      new Float32Array(magnitudes),
      1
    );

    geometry.attributes.aTwinkle = new BufferAttribute(
      new Float32Array(twinkles),
      2
    );

    const material = new ShaderMaterial({
      depthTest: false,
      transparent: true,
      // additive: overlapping stars glow brighter instead of occluding
      blending: AdditiveBlending,
      uniforms: {
        uSize: { value: 12.5 * this.renderer.getPixelRatio() },
        uTime: { value: 0 },
      },
      defines: {
        USE_COLOR: "",
      },
      fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      ${STAR_SPRITE_GLSL}

      void main()	{

          gl_FragColor = vec4( vColor, starSpriteAlpha(gl_PointCoord) * vAlpha );

      }
      `,
      vertexShader: `
      attribute float aMagnitude;
      attribute vec2 aTwinkle;

      varying vec3 vColor;
      varying float vAlpha;

      uniform float uSize;
      uniform float uTime;

      ${HORIZON_FADE_GLSL}

      void main()	{

          vColor = color;

          // z runs 0 (near) to 1 (far): far stars render smaller and dimmer,
          // matching their slower drift so the speed variance reads as depth
          float depth = position.z;

          float twinkle = .75 + .25 * sin(uTime * aTwinkle.y + aTwinkle.x);

          float horizon = horizonFade(position.y);

          vAlpha = twinkle
              * mix(1., .3, depth)
              * mix(.35, 1., aMagnitude)
              * horizon;

          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          gl_PointSize = uSize * mix(1., .4, depth) * mix(.4, 1., aMagnitude);

      }
      `,
    });

    this.object = new Points(geometry, material);
    this.resize();
    this.scene.add(this.object);
  }

  /** Fit the star plane to the current viewport (also sizes it initially). */
  resize = (): void => {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    const planeDimensions = new Vector3(
      1.05 * viewport.z,
      1.05 * viewport.w,
      1
    );
    this.object.scale.copy(planeDimensions);
    this.object.position.copy(planeDimensions.clone().multiplyScalar(-0.5));
    // plane-unit x per plane-unit y for a 45-degree drift in screen px;
    // the plane is stretched to the viewport, so unit axes aren't square
    this.aspect = planeDimensions.y / planeDimensions.x;
  };

  update = (delta: number): void => {
    const geom = this.object.geometry as BufferGeometry;
    geom.setDrawRange(0, Math.min(window.innerWidth, COUNT));

    this.time += delta;
    (this.object.material as ShaderMaterial).uniforms.uTime.value = this.time;

    const position = geom.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      // far stars (z near 1) drift slower than near ones (z near 0)
      const zFactor = lerp(0.5, 1, position.getZ(i));
      const lifecycleNext = this.lifecycles[i] + delta * SPEED * (1 / zFactor);
      this.lifecycles[i] = lifecycleNext % 1;
      position.setY(i, getY(this.lifecycles[i]));
      // x advances in lockstep with y: a 45-degree up-right drift
      position.setX(i, (this.xOrigins[i] + this.lifecycles[i] * this.aspect) % 1);
    }
    (geom.attributes.position as BufferAttribute).needsUpdate = true;
  };
}
