import {
  Color,
  Mesh,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";

import { CHANNEL_GLSL, GLOW_WARM, HORIZON_VH } from "./LandingPageWater";

/**
 * Atmosphere for the landing page: a sky quad (top-of-frame darkening plus
 * a corner vignette, so the scene reads cinematic rather than flat), two
 * fog quads standing on the channel horizon — one behind the treeline
 * carrying the moonlit glow, one in front at low strength so the mist
 * wraps the tree tops — a warm ember of light at the channel mouth that
 * filters through the far trees, and a channel-aware mist that pools along
 * the shorelines and the horizon so land and water dissolve into each
 * other instead of meeting at a line. Everything is shader-driven, with
 * slowly drifting fbm noise so it reads as alive rather than a gradient.
 */

/** Fog quad heights as fractions of the viewport. */
const BACK_HEIGHT_VH = 0.42;
const FRONT_HEIGHT_VH = 0.26;
/** Glow center in quad UV space: over the channel mouth, near the trees. */
const GLOW_CENTER = new Vector2(0.56, 0.22);
/** Fog strengths; the front mist only wraps the tree tops. */
const BACK_INTENSITY = 0.2;
const FRONT_INTENSITY = 0.06;
/**
 * Vertical brightness band per layer (in quad UV): the mist peaks around the
 * tree tops and fades toward both the sky and the horizon.
 */
const BACK_BAND = new Vector2(0.3, 0.2);
const FRONT_BAND = new Vector2(0.55, 0.25);

const FOG_COLOR = new Color("#b9cadf");
const SKY_COLOR = new Color("#030609");

/** Ember quad height as a fraction of the viewport. */
const EMBER_HEIGHT_VH = 0.2;
const EMBER_COLOR = new Color(GLOW_WARM);
const EMBER_INTENSITY = 0.4;

/** Shore/horizon mist strength. */
const MIST_INTENSITY = 0.15;

const NOISE_GLSL = `
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3. - 2. * f);
    return mix(
        mix(hash(i), hash(i + vec2(1., 0.)), u.x),
        mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x),
        u.y
    );
}

float fbm(vec2 p) {
    float value = 0.;
    float amplitude = .5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.03;
        amplitude *= .5;
    }
    return value;
}
`;

const FOG_FRAGMENT = `
varying vec2 vUv;

uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;
uniform vec2 uGlowCenter;
uniform vec2 uBand;

${NOISE_GLSL}

void main() {
    // brightness band: peaks at uBand.x, fades toward sky and quad bottom
    float bandOffset = (vUv.y - uBand.x) / uBand.y;
    float band = exp(-bandOffset * bandOffset);

    // soft elliptical glow, like a moon behind the trees; falls off firmly
    // to the sides so the mist never reads as a full-width stripe
    vec2 d = (vUv - uGlowCenter) * vec2(2.4, 2.4);
    float glow = exp(-dot(d, d) * 2.);

    // two noise fields drifting at different speeds read as depth; stretched
    // vertically (high x frequency, low y frequency) so the structure reads
    // as faint light shafts rather than blobs
    float drift = fbm(vUv * vec2(6., 2.5) + vec2(uTime * .014, -uTime * .004));
    float billow = fbm(vUv * vec2(12., 5.) - vec2(uTime * .008, uTime * .003));
    float density = .75 + .18 * drift + .07 * billow;

    float alpha = band * (.05 + .95 * glow) * density * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
}
`;

const EMBER_FRAGMENT = `
varying vec2 vUv;

uniform float uTime;
uniform float uAspect;
uniform float uIntensity;
uniform vec3 uColor;

${NOISE_GLSL}

void main() {
    // warm light deep in the woods at the channel mouth, breathing slowly,
    // its edge eaten into by drifting noise so it seems to filter through
    // the canopy
    vec2 d = vec2((vUv.x - .56) * uAspect * .7, (vUv.y - .3) * 1.4);
    float glow = exp(-dot(d, d) * 4.);
    float breathe = .8 + .2 * sin(uTime * .12);
    float filtered = .5 + .5 * fbm(vec2(vUv.x * uAspect * 3. - uTime * .01, vUv.y * 4.));
    gl_FragColor = vec4(uColor, glow * breathe * filtered * uIntensity);
}
`;

const MIST_FRAGMENT = `
varying vec2 vUv;

uniform float uTime;
uniform float uAspect;
uniform float uIntensity;
uniform vec3 uColor;

${NOISE_GLSL}
${CHANNEL_GLSL}

void main() {
    vec2 ch = channelAt(vUv.y);
    float u = (vUv.x - ch.x) / ch.y;

    // mist pools along both shorelines (|u| near 1), veiling the junction
    // where tree bases meet their reflections
    float shoreline = exp(-pow((abs(u) - 1.) * 3.5, 2.)) * (1. - vUv.y * .5);

    // and gathers around the channel mouth at the horizon — weighted
    // toward the channel so it dissolves the far junction without drawing
    // a new straight pale stripe across the frame
    float horizon = smoothstep(.72, 1., vUv.y) * (.35 + .65 * exp(-u * u * .7));

    float drift = .6 + .4 * fbm(vec2(vUv.x * uAspect * 1.5 + uTime * .012, vUv.y * 3.));

    float alpha = (shoreline * .6 + horizon * .7) * drift * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
}
`;

const SKY_FRAGMENT = `
varying vec2 vUv;

uniform vec3 uColor;

void main() {
    // deepen toward the top of the frame, leaving the horizon untouched
    float top = .9 * smoothstep(.2, 1., vUv.y);

    // corner vignette
    vec2 fromCenter = (vUv - .5) * vec2(1.15, 1.);
    float vignette = .6 * smoothstep(.4, .9, length(fromCenter));

    gl_FragColor = vec4(uColor, min(1., top + vignette));
}
`;

const VERTEX = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

export class LandingPageFog {
  scene: Scene;
  renderer: WebGLRenderer;
  private skyMesh: Mesh;
  private backMesh: Mesh;
  private frontMesh: Mesh;
  private emberMesh: Mesh;
  private mistMesh: Mesh;
  private animatedMaterials: ShaderMaterial[];
  private time = 0;

  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    const fogMaterial = (intensity: number, band: Vector2) =>
      new ShaderMaterial({
        transparent: true,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: intensity },
          uColor: { value: FOG_COLOR },
          uGlowCenter: { value: GLOW_CENTER },
          uBand: { value: band },
        },
        vertexShader: VERTEX,
        fragmentShader: FOG_FRAGMENT,
      });

    const glowMaterial = (
      intensity: number,
      color: Color,
      fragment: string,
    ) =>
      new ShaderMaterial({
        transparent: true,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uIntensity: { value: intensity },
          uColor: { value: color },
        },
        vertexShader: VERTEX,
        fragmentShader: fragment,
      });

    const skyMaterial = new ShaderMaterial({
      transparent: true,
      depthTest: false,
      uniforms: {
        uColor: { value: SKY_COLOR },
      },
      vertexShader: VERTEX,
      fragmentShader: SKY_FRAGMENT,
    });

    const backMaterial = fogMaterial(BACK_INTENSITY, BACK_BAND);
    const frontMaterial = fogMaterial(FRONT_INTENSITY, FRONT_BAND);
    const emberMaterial = glowMaterial(
      EMBER_INTENSITY,
      EMBER_COLOR,
      EMBER_FRAGMENT,
    );
    const mistMaterial = glowMaterial(MIST_INTENSITY, FOG_COLOR, MIST_FRAGMENT);
    this.animatedMaterials = [
      backMaterial,
      frontMaterial,
      emberMaterial,
      mistMaterial,
    ];

    this.skyMesh = new Mesh(new PlaneBufferGeometry(1, 1), skyMaterial);
    this.skyMesh.renderOrder = -1;

    this.backMesh = new Mesh(new PlaneBufferGeometry(1, 1), backMaterial);
    this.backMesh.renderOrder = 2;

    this.frontMesh = new Mesh(new PlaneBufferGeometry(1, 1), frontMaterial);
    this.frontMesh.renderOrder = 5;

    // behind the backdrop strip (2.6): the light filters through the far trees
    this.emberMesh = new Mesh(new PlaneBufferGeometry(1, 1), emberMaterial);
    this.emberMesh.renderOrder = 2.55;

    // over the banks (4): mist reads as hanging in front of the trees
    this.mistMesh = new Mesh(new PlaneBufferGeometry(1, 1), mistMaterial);
    this.mistMesh.renderOrder = 5.5;

    this.scene.add(
      this.skyMesh,
      this.backMesh,
      this.frontMesh,
      this.emberMesh,
      this.mistMesh,
    );
    this.resize();
  }

  resize = (): void => {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    const bottom = -viewport.w / 2;
    // the fog banks stand on the channel horizon, not the frame bottom
    const horizon = bottom + Math.round(HORIZON_VH * viewport.w);

    this.skyMesh.scale.set(viewport.z, viewport.w, 1);
    this.skyMesh.position.set(0, 0, 0);

    const backHeight = BACK_HEIGHT_VH * viewport.w;
    this.backMesh.scale.set(viewport.z, backHeight, 1);
    this.backMesh.position.set(0, horizon + backHeight / 2, 0);

    const frontHeight = FRONT_HEIGHT_VH * viewport.w;
    this.frontMesh.scale.set(viewport.z, frontHeight, 1);
    this.frontMesh.position.set(0, horizon + frontHeight / 2, 0);

    const emberHeight = EMBER_HEIGHT_VH * viewport.w;
    this.emberMesh.scale.set(viewport.z, emberHeight, 1);
    // straddles the horizon: the glow reaches both the far trees above it
    // and the top of the water below it
    this.emberMesh.position.set(0, horizon + emberHeight / 4, 0);
    (this.emberMesh.material as ShaderMaterial).uniforms.uAspect.value =
      viewport.z / emberHeight;

    const mistHeight = Math.round(HORIZON_VH * viewport.w);
    this.mistMesh.scale.set(viewport.z, mistHeight, 1);
    this.mistMesh.position.set(0, bottom + mistHeight / 2, 0);
    (this.mistMesh.material as ShaderMaterial).uniforms.uAspect.value =
      viewport.z / mistHeight;
  };

  update = (delta: number): void => {
    this.time += delta;
    for (const material of this.animatedMaterials) {
      material.uniforms.uTime.value = this.time;
    }
  };
}
