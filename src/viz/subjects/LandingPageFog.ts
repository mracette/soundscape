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

/**
 * Atmosphere for the landing page: a sky quad (top-of-frame darkening plus a
 * corner vignette, so the scene reads cinematic rather than flat), and two
 * fog quads anchored to the bottom — one behind the near treeline carrying
 * the moonlit glow, one in front at low strength so the mist wraps the tree
 * tops instead of stopping behind them. Fog is entirely shader-driven, with
 * slowly drifting fbm noise so it reads as alive rather than a gradient.
 */

/** Fog quad heights as fractions of the viewport. */
const BACK_HEIGHT_VH = 0.5;
const FRONT_HEIGHT_VH = 0.32;
/** Glow center in quad UV space; x slightly off-center, y near the treetops. */
const GLOW_CENTER = new Vector2(0.52, 0.25);
/** Fog strengths; the front mist only wraps the tree tops. */
const BACK_INTENSITY = 0.32;
const FRONT_INTENSITY = 0.09;
/**
 * Vertical brightness band per layer (in quad UV): the mist peaks around the
 * tree tops and fades toward both the sky and the frame bottom — the bottom
 * of the reference scene reads dark, not washed.
 */
const BACK_BAND = new Vector2(0.3, 0.2);
const FRONT_BAND = new Vector2(0.7, 0.25);

const FOG_COLOR = new Color("#b9cadf");
const SKY_COLOR = new Color("#030609");

const FOG_FRAGMENT = `
varying vec2 vUv;

uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;
uniform vec2 uGlowCenter;
uniform vec2 uBand;

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

void main() {
    // brightness band: peaks at uBand.x, fades toward sky and frame bottom
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
  private fogMaterials: ShaderMaterial[];
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
    this.fogMaterials = [backMaterial, frontMaterial];

    this.skyMesh = new Mesh(new PlaneBufferGeometry(1, 1), skyMaterial);
    this.skyMesh.renderOrder = -1;

    this.backMesh = new Mesh(new PlaneBufferGeometry(1, 1), backMaterial);
    this.backMesh.renderOrder = 2;

    this.frontMesh = new Mesh(new PlaneBufferGeometry(1, 1), frontMaterial);
    this.frontMesh.renderOrder = 5;

    this.scene.add(this.skyMesh, this.backMesh, this.frontMesh);
    this.resize();
  }

  resize = (): void => {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    const bottom = -viewport.w / 2;

    this.skyMesh.scale.set(viewport.z, viewport.w, 1);
    this.skyMesh.position.set(0, 0, 0);

    const backHeight = BACK_HEIGHT_VH * viewport.w;
    this.backMesh.scale.set(viewport.z, backHeight, 1);
    this.backMesh.position.set(0, bottom + backHeight / 2, 0);

    const frontHeight = FRONT_HEIGHT_VH * viewport.w;
    this.frontMesh.scale.set(viewport.z, frontHeight, 1);
    this.frontMesh.position.set(0, bottom + frontHeight / 2, 0);
  };

  update = (delta: number): void => {
    this.time += delta;
    for (const material of this.fogMaterials) {
      material.uniforms.uTime.value = this.time;
    }
  };
}
