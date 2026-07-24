import {
  Color,
  Mesh,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";

/**
 * Still water along the bottom of the landing page, entirely shader-drawn:
 * a near-black basin that catches the light coming out of the forest above
 * it. Three visual systems share one quad — vertical reflection streaks
 * under each forest glow pocket, expanding elliptical ripple rings, and
 * sparse twinkling glints — all animated in the fragment shader.
 */

/** Height of the water band as a fraction of the viewport. */
export const WATERLINE_VH = 0.16;

/**
 * Horizontal centers (viewport-x fraction) of the forest glow pockets. The
 * fog's glow quad and the water's reflection streaks both read these, so
 * every light in the trees has its reflection directly below it.
 */
export const GLOW_POCKET_XS = [0.24, 0.58, 0.82];

const DEEP_COLOR = new Color("#04070c");
const SHALLOW_COLOR = new Color("#0e1622");

/**
 * Warm lamplight tone shared by the forest glow pockets and everything they
 * light up in the water. Deeper gold than the star-field `moonYellow`: at
 * these low intensities a near-white cream reads gray, not warm.
 */
export const GLOW_WARM = "#ffdf9e";
const GLINT_COLOR = new Color(GLOW_WARM);
/** Same moonlit blue as the fog, so sky and water share one atmosphere. */
const SHEEN_COLOR = new Color("#b9cadf");

const FRAGMENT = `
varying vec2 vUv;

uniform float uTime;
// quad width over quad height: converts uv.x into height units so
// distances read the same on both axes
uniform float uAspect;
uniform vec3 uGlowXs;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uGlint;
uniform vec3 uSheen;

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

// reflection path below one glow pocket: brightest at the waterline,
// dissolving downward, wobbling sideways, and — critically — broken into
// horizontal dashes by wave crests; a smooth solid column reads as a
// cartoon light beam, a dashed one reads as light on water
float streak(float glowX) {
    float wobble = (noise(vec2(vUv.y * 7. - uTime * .18, glowX * 43.)) - .5)
        * .06 * (1.3 - vUv.y);
    float d = (vUv.x - glowX + wobble) * uAspect;
    float column = exp(-d * d * 14.);
    float fall = pow(vUv.y, 1.7);
    float dashes = .35 + .65 * noise(vec2(glowX * 61. + d * 2., vUv.y * 26. - uTime * .3));
    return column * fall * dashes;
}

// one expanding ripple ring, heavily squashed vertically (the water plane
// is seen edge-on) and broken up around its circumference by noise so it
// reads as catching light rather than drawn with a compass
float ripple(vec2 p, vec2 center, float seed) {
    vec2 d = p - center;
    float dist = length(vec2(d.x, d.y * 4.));
    // each ring runs its own slow cycle: born small, expands, fades out
    float cycle = fract(uTime * .045 + seed);
    float radius = .08 + cycle * 1.1;
    float ring = exp(-pow((dist - radius) * 22., 2.));
    // a fainter trailing ring makes the swirl read concentric
    float inner = .5 * exp(-pow((dist - radius * .55) * 26., 2.));
    float life = smoothstep(0., .15, cycle) * (1. - cycle) * (1. - cycle);
    // a full circle reads as a drawn stroke; keep only the arcs that would
    // catch the light, and dust them with grain so they sparkle
    float arc = smoothstep(.3, .75, noise(vec2(atan(d.y, d.x) * 1.6, seed * 23. + cycle * 2.)));
    float grain = .25 + .75 * noise(p * 46. + seed * 29.);
    return (ring + inner) * life * arc * grain;
}

// sparse star-like glints drifting through their own twinkle cycles
float glints(vec2 p) {
    vec2 cell = floor(p * 26.);
    float h = hash(cell);
    if (h < .9) return 0.;
    vec2 center = (cell + .5 + .35 * (vec2(hash(cell + 7.), hash(cell + 13.)) - .5)) / 26.;
    float d = length((p - center) * vec2(1., 2.5)) * 15.;
    float point = smoothstep(.5, 0., d);
    float twinkle = pow(.5 + .5 * sin(uTime * (.6 + h * 1.8) + h * 40.), 3.);
    return point * twinkle;
}

void main() {
    // height-unit space: y in [0, 1], x scaled to match
    vec2 p = vec2(vUv.x * uAspect, vUv.y);

    vec3 col = mix(uDeep, uShallow, pow(vUv.y, 2.2));

    float light = streak(uGlowXs.x) + streak(uGlowXs.y) + streak(uGlowXs.z);

    // ripples live only where light falls — a ring in black water reads as
    // a stain, a ring inside a light path reads as the water moving
    float rings =
        ripple(p, vec2(uGlowXs.x * uAspect, .42), .0) +
        ripple(p, vec2(uGlowXs.y * uAspect, .3), .37) +
        ripple(p, vec2(uGlowXs.z * uAspect, .5), .61);

    // light paths blow out toward white at their core so the warm tone
    // reads as brightness, not beige paint
    col += mix(uGlint, vec3(1.), min(light, 1.) * .28) * light * .85;
    col += uGlint * rings * (.3 + .6 * light);

    // faint cool sheen drifting across the whole surface ties the lit paths
    // to the dark stretches between them
    float sheen = fbm(vec2(p.x * .7 - uTime * .02, vUv.y * 3.));
    col += uSheen * sheen * pow(vUv.y, 2.) * .09;

    // a thin bright meniscus where the water meets the forest
    col += uGlint * .18 * exp(-(1. - vUv.y) * 34.) * (.4 + light);

    col += uGlint * glints(p) * (.55 + 1.6 * light);

    gl_FragColor = vec4(col, 1.);
}
`;

const VERTEX = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

export class LandingPageWater {
  scene: Scene;
  renderer: WebGLRenderer;
  private mesh: Mesh;
  private material: ShaderMaterial;
  private time = 0;

  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.material = new ShaderMaterial({
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uGlowXs: { value: new Vector3(...GLOW_POCKET_XS) },
        uDeep: { value: DEEP_COLOR },
        uShallow: { value: SHALLOW_COLOR },
        uGlint: { value: GLINT_COLOR },
        uSheen: { value: SHEEN_COLOR },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
    });

    this.mesh = new Mesh(new PlaneBufferGeometry(1, 1), this.material);
    this.mesh.renderOrder = 6;
    this.scene.add(this.mesh);
    this.resize();
  }

  resize = (): void => {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    const height = Math.round(WATERLINE_VH * viewport.w);
    this.mesh.scale.set(viewport.z, height, 1);
    this.mesh.position.set(0, -viewport.w / 2 + height / 2, 0);
    this.material.uniforms.uAspect.value = viewport.z / height;
  };

  update = (delta: number): void => {
    this.time += delta;
    this.material.uniforms.uTime.value = this.time;
  };
}
