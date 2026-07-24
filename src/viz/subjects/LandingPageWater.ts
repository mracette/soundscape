import {
  Color,
  Mesh,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Vector4,
  WebGLRenderer,
} from "three";

/**
 * The water of the landing page: a channel that sweeps across the frame
 * bottom and recedes between the forested banks toward a glowing vanishing
 * point, inviting the viewer in. Entirely shader-drawn and animated: warm
 * light spilling from the channel mouth, a dashed reflection lane running
 * down the centerline, perspective-compressed ripple shimmer, and currents
 * of stardust drifting toward the viewer.
 *
 * This file also owns the channel geometry (centerline + width by depth),
 * shared with the treeline (bank placement) and the fog (shore mist) so
 * land, water, and atmosphere agree about where the shoreline is.
 */

/** Top of the water — the channel's horizon — as a viewport fraction. */
export const HORIZON_VH = 0.3;

/** How far right of frame center the channel mouth sits at the horizon. */
const CHANNEL_DRIFT = 0.08;
/** S-curve swing of the centerline, damped toward the horizon. */
const MEANDER = 0.13;
/** Channel half-widths (viewport-x fraction) at the frame bottom / horizon. */
const HALF_NEAR = 0.28;
const HALF_FAR = 0.03;
/** Perspective exponent: how quickly the channel narrows with depth. */
const NARROWING = 1.4;

/**
 * Channel centerline and half-width at depth t (0 = frame bottom,
 * 1 = horizon), in viewport-x fractions.
 */
export const channelAt = (t: number) => ({
  center: 0.5 + CHANNEL_DRIFT * t + MEANDER * Math.sin(5 * t) * (1 - t),
  halfWidth: HALF_FAR + (HALF_NEAR - HALF_FAR) * Math.pow(1 - t, NARROWING),
});

/** GLSL mirror of `channelAt` — keep the two in lockstep. */
export const CHANNEL_GLSL = `
vec2 channelAt(float t) {
    float center = .5 + ${CHANNEL_DRIFT} * t + ${MEANDER} * sin(5. * t) * (1. - t);
    float halfWidth = ${HALF_FAR} + ${HALF_NEAR - HALF_FAR} * pow(1. - t, ${NARROWING});
    return vec2(center, halfWidth);
}
`;

const DEEP_COLOR = new Color("#050b14");
const SHALLOW_COLOR = new Color("#142033");

/**
 * Warm lamplight tone shared by the channel-mouth glow and everything it
 * lights up. Deeper gold than the star-field `moonYellow`: at these low
 * intensities a near-white cream reads gray, not warm.
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

${CHANNEL_GLSL}

// sparse star-like glints in flow space, drifting slowly toward the viewer
// through their own twinkle cycles
float glints(vec2 p) {
    vec2 cell = floor(p * 10.);
    float h = hash(cell);
    if (h < .82) return 0.;
    vec2 center = (cell + .5 + .35 * (vec2(hash(cell + 7.), hash(cell + 13.)) - .5)) / 10.;
    float d = length(p - center) * 10.;
    float point = smoothstep(.45, 0., d);
    float twinkle = pow(.5 + .5 * sin(uTime * (.6 + h * 1.8) + h * 40.), 3.);
    return point * twinkle;
}

void main() {
    vec2 ch = channelAt(vUv.y);
    // cross-channel coordinate: 0 on the centerline, ±1 at the shorelines
    float u = (vUv.x - ch.x) / ch.y;
    // perspective depth: rows of water compress toward the horizon
    float pv = 1. / (1.12 - vUv.y);

    // night water reflects the sky: blue, brightening toward the horizon
    // and again gently toward the viewer, so the near silhouettes always
    // have luminous water to read against
    vec3 col = mix(uDeep, uShallow, pow(vUv.y, 1.3));
    col += uSheen * .05 * pow(vUv.y, 2.4);
    col += uSheen * .09 * pow(1. - vUv.y, 1.8);

    // the cross coordinate undulates so every edge in the water — the bank
    // reflections, the light lane — has a wavy waterline, never a ruled line
    float wob = (noise(vec2(pv * 2.2 - uTime * .07, u * 1.5)) - .5) * .3;
    float uw = u + wob * (1. - vUv.y * .5);

    // dark mirror of the banks along both shorelines — the signature that
    // makes the surface read as water rather than ground
    // stronger in the distance, gentler up close: the foreground water
    // stays luminous so the giant corner trees always silhouette against it
    float bankRefl = smoothstep(.45, 1., abs(uw));
    col = mix(col, uDeep * .75, bankRefl * (.2 + .35 * vUv.y));

    // thin bright waterline sliver where each bank meets its reflection —
    // the tonal break that separates land from water
    float sliver = smoothstep(.09, .0, abs(abs(uw) - 1.05));
    col += uSheen * sliver * .3 * (1. - vUv.y * .4);

    float inChannel = smoothstep(1.12, .92, abs(uw));

    // warm light spilling broadly out of the channel mouth, and its lane
    // of reflection running down the centerline, broken by waves
    float mouth = exp(-uw * uw * .25) * pow(vUv.y, 2.8);
    float dashes = .45 + .55 * noise(vec2(uw * 2., pv * 5. - uTime * .22));
    float lane = exp(-uw * uw * 3.5) * (.25 + .75 * vUv.y) * dashes;
    float light = (mouth * .45 + lane * .5) * inChannel;

    col += mix(uGlint, vec3(1.), min(light, 1.) * .15) * light;

    // uniform ripple shimmer across the whole surface — horizontal bands,
    // perspective-compressed, brighter where the water is lit
    float rip = noise(vec2(vUv.x * uAspect * .6, pv * 7. - uTime * .1)) - .5;
    float ripFine = noise(vec2(vUv.x * uAspect * 1.7, pv * 14. - uTime * .16)) - .5;
    col *= 1. + (rip * .3 + ripFine * .15) * (.4 + light);

    // stardust swirls: thin glowing isolines of a drifting noise field,
    // flowing over the whole surface like currents of dust on the water
    float swirl = fbm(vec2(uw * 1.8, pv * 1.1 - uTime * .02));
    float iso = abs(fract(swirl * 3.) - .5);
    float swirlLines = smoothstep(.1, .0, iso) * smoothstep(.35, .6, swirl);
    col += mix(vec3(.75, .85, 1.), uGlint, min(light * 1.5, 1.))
        * swirlLines * .16 * (.5 + light + bankRefl * .4);

    // glints ride the swirls: sparkles cluster where the current runs
    float dust = glints(vec2(uw * 3.6, pv * 1.4 - uTime * .02));
    vec3 dustColor = mix(vec3(.75, .85, 1.), uGlint, min(light * 1.5, 1.));
    col += dustColor * dust * (.15 + 1.1 * swirlLines + .5 * light);

    // faint cool sheen keeps the dark stretches alive
    float sheen = fbm(vec2(vUv.x * uAspect * .7 - uTime * .02, pv * 2.));
    col += uSheen * sheen * .05;

    // warm meniscus where the water disappears into the woods
    col += uGlint * exp(-(1. - vUv.y) * 26.) * exp(-u * u * 1.2) * .25;

    // sub-LSB dither: the smooth glow falloffs over dark water band
    // visibly in 8-bit output without it
    col += (hash(gl_FragCoord.xy) - .5) / 128.;

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
        uDeep: { value: DEEP_COLOR },
        uShallow: { value: SHALLOW_COLOR },
        uGlint: { value: GLINT_COLOR },
        uSheen: { value: SHEEN_COLOR },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
    });

    this.mesh = new Mesh(new PlaneBufferGeometry(1, 1), this.material);
    // opaque: draws in the opaque pass, under every transparent layer —
    // the banks and mist composite over it
    this.mesh.renderOrder = 0;
    this.scene.add(this.mesh);
    this.resize();
  }

  resize = (): void => {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    const height = Math.round(HORIZON_VH * viewport.w);
    this.mesh.scale.set(viewport.z, height, 1);
    this.mesh.position.set(0, -viewport.w / 2 + height / 2, 0);
    this.material.uniforms.uAspect.value = viewport.z / height;
  };

  update = (delta: number): void => {
    this.time += delta;
    this.material.uniforms.uTime.value = this.time;
  };
}
