import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineSegments,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";

import { lerp, TAU } from "../../utils/mathUtils";
import { HORIZON_FADE_GLSL, STAR_SPRITE_GLSL } from "./LandingPageParticles";

/**
 * Constellations for the landing page starfield.
 *
 * Figures are hand-authored templates — familiar objects abstracted the way
 * star charts abstract them: a handful of stars, straight hairline edges,
 * wide angles, and deliberate asymmetry. Per-spawn jitter, rotation, and
 * mirroring keep repeat sightings from feeling stamped. Each figure is a
 * rigid THREE.Group of dedicated stars plus line segments, so per-frame
 * motion is a single group.position.y write and the figure never shears as
 * it drifts with the field.
 */

const CONSTELLATION_COUNT = 5;
/** Matches LandingPageParticles.SPEED: lifecycle fraction per second. */
const FIELD_SPEED = 0.004;
/** Figures use far-field depth factors so they drift with the slow stars. */
const Z_FACTOR_MIN = 0.85;
/** Figure size band as a fraction of the viewport's smaller dimension. */
const SCALE_MIN = 0.22;
const SCALE_MAX = 0.34;
/** Per-star placement noise, as a fraction of figure size. */
const JITTER = 0.04;
/** Gap between a line end and its star, like a printed chart figure. */
const LINE_GAP = 7;
const EDGE_MARGIN = 20;

interface FigureTemplate {
  /** Star positions in a unit box (roughly [-0.5, 0.5]², y up). */
  points: [number, number][];
  /** Index pairs into `points`; a point with no edges is a lone bright star. */
  edges: [number, number][];
}

/**
 * The template library. Authoring rules: 6–9 stars, no perfect symmetry,
 * polylines over closed curves, and at most degree-3 junctions — the
 * perceptual grammar of real constellation figures.
 */
const TEMPLATES: Record<string, FigureTemplate> = {
  harp: {
    // slanted frame around two near-vertical strings; strings meet the
    // soundboard bar at their own stars, which is what makes it a harp
    points: [
      [-0.26, -0.42],
      [0.3, -0.48],
      [0.34, 0.3],
      [0.2, 0.46],
      [-0.3, 0.38],
      [-0.12, 0.41],
      [0.04, 0.44],
      [-0.08, -0.43],
      [0.1, -0.45],
    ],
    edges: [
      [0, 7],
      [7, 8],
      [8, 1],
      [1, 2],
      [2, 3],
      [3, 6],
      [6, 5],
      [5, 4],
      [4, 0],
      [5, 7],
      [6, 8],
    ],
  },
  fish: {
    // long body quad with a small tail fork; the eye is a lone bright star
    points: [
      [-0.5, -0.02],
      [-0.14, 0.16],
      [0.26, 0.0],
      [-0.1, -0.16],
      [0.48, 0.14],
      [0.5, -0.12],
      [-0.36, 0.02],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
      [2, 5],
    ],
  },
  sailboat: {
    // hull trapezoid; mast aft, so the sail reads as a right triangle
    points: [
      [-0.48, -0.1],
      [0.42, -0.06],
      [0.28, -0.34],
      [-0.34, -0.36],
      [0.3, 0.52],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 1],
      [4, 0],
    ],
  },
  tree: {
    // trunk splitting into two branches and a leaning crown tip
    points: [
      [0.0, -0.5],
      [0.02, -0.1],
      [-0.26, 0.18],
      [-0.38, 0.44],
      [0.24, 0.14],
      [0.44, 0.38],
      [0.04, 0.5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
      [4, 5],
      [4, 6],
    ],
  },
  apple: {
    // irregular ring with a dented top, stem star above the dent
    points: [
      [0.0, -0.42],
      [0.34, -0.28],
      [0.42, 0.1],
      [0.16, 0.3],
      [0.01, 0.26],
      [-0.14, 0.32],
      [-0.42, 0.06],
      [-0.3, -0.3],
      [0.08, 0.5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
      [4, 8],
    ],
  },
  hat: {
    // witch's hat: brim polyline with a cone rising to a bent tip
    points: [
      [-0.5, -0.3],
      [-0.24, -0.22],
      [0.26, -0.2],
      [0.5, -0.26],
      [0.06, 0.3],
      [0.24, 0.5],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
      [2, 4],
      [4, 5],
    ],
  },
  lotus: {
    // center petal in a cup of side petals whose tips lean back inward
    points: [
      [-0.18, -0.4],
      [0.2, -0.38],
      [0.01, 0.5],
      [-0.4, 0.02],
      [-0.3, 0.36],
      [0.42, 0.05],
      [0.33, 0.4],
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 2],
      [0, 3],
      [3, 4],
      [1, 5],
      [5, 6],
    ],
  },
  note: {
    // eighth note: slanted head, stem, two-segment flag
    points: [
      [-0.34, -0.36],
      [-0.16, -0.3],
      [-0.12, -0.46],
      [-0.3, -0.52],
      [-0.1, 0.3],
      [0.1, 0.1],
      [0.14, -0.12],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [1, 4],
      [4, 5],
      [5, 6],
    ],
  },
};

interface Figure {
  points: Vector2[];
  edges: [number, number][];
  halfWidth: number;
  halfHeight: number;
}

interface Constellation {
  group: Group;
  /** Drift in px/s (applied to x and y equally: a 45-degree track). */
  speed: number;
  /** y at which the figure has fully exited the top of the viewport. */
  yMax: number;
  /** x at which the figure has fully exited the right edge; wraps to -xMax. */
  xMax: number;
  /** Horizontal slot index; respawned figures stay in their lane. */
  slot: number;
}

/**
 * Instantiate a template at the given size (px): jitter each star, rotate to
 * a fully random angle — like real constellations, whose orientation is
 * whatever the sky gave them — mirror half the time, and center on the
 * bounding box.
 */
const buildFigure = (template: FigureTemplate, scale: number): Figure => {
  const rotation = Math.random() * TAU;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const mirror = Math.random() < 0.5 ? -1 : 1;

  const points = template.points.map(([x, y]) => {
    const jx = x * mirror + (Math.random() * 2 - 1) * JITTER;
    const jy = y + (Math.random() * 2 - 1) * JITTER;
    return new Vector2(
      (jx * cos - jy * sin) * scale,
      (jx * sin + jy * cos) * scale
    );
  });

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  points.forEach((p) => p.set(p.x - cx, p.y - cy));

  return {
    points,
    edges: template.edges,
    halfWidth: (Math.max(...xs) - Math.min(...xs)) / 2,
    halfHeight: (Math.max(...ys) - Math.min(...ys)) / 2,
  };
};

export class LandingPageConstellations {
  scene: Scene;
  renderer: WebGLRenderer;
  private constellations: Constellation[] = [];
  private starMaterial: ShaderMaterial;
  private lineMaterial: ShaderMaterial;
  private viewWidth: number;
  private viewHeight: number;
  private time = 0;
  /** Shuffle bag of template names so every object appears before repeats. */
  private bag: string[] = [];

  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    this.viewWidth = viewport.z;
    this.viewHeight = viewport.w;

    // Constellation stars: the shared sprite, white and steadier than the
    // field so figures read as the bright members of the sky.
    this.starMaterial = new ShaderMaterial({
      depthTest: false,
      transparent: true,
      blending: AdditiveBlending,
      uniforms: {
        uSize: { value: 11 * this.renderer.getPixelRatio() },
        uTime: { value: 0 },
        uViewHeight: { value: this.viewHeight },
      },
      fragmentShader: `
      varying float vAlpha;

      ${STAR_SPRITE_GLSL}

      void main() {
          gl_FragColor = vec4( vec3(1.), starSpriteAlpha(gl_PointCoord) * vAlpha );
      }
      `,
      vertexShader: `
      attribute float aPhase;
      attribute float aMagnitude;

      varying float vAlpha;

      uniform float uSize;
      uniform float uTime;
      uniform float uViewHeight;

      ${HORIZON_FADE_GLSL}

      void main() {
          float twinkle = .8 + .2 * sin(uTime * 1.5 + aPhase);
          vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
          float horizon = horizonFade(worldPosition.y / uViewHeight + .5);
          vAlpha = twinkle * mix(.55, 1., aMagnitude) * horizon;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
          gl_PointSize = uSize * mix(.6, 1.2, aMagnitude);
      }
      `,
    });

    // same horizon fade as the stars; LineBasicMaterial can't fade by world
    // position, so the lines get their own minimal shader
    this.lineMaterial = new ShaderMaterial({
      transparent: true,
      depthTest: false,
      uniforms: {
        uViewHeight: { value: this.viewHeight },
      },
      vertexShader: `
      varying float vFade;

      uniform float uViewHeight;

      ${HORIZON_FADE_GLSL}

      void main() {
          vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
          vFade = horizonFade(worldPosition.y / uViewHeight + .5);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
      `,
      fragmentShader: `
      varying float vFade;

      void main() {
          gl_FragColor = vec4( vec3(1.), .18 * vFade );
      }
      `,
    });

    for (let slot = 0; slot < CONSTELLATION_COUNT; slot++) {
      const constellation = this.spawn(slot);
      // stagger starting heights so the set is always partially on screen
      constellation.group.position.y = lerp(
        -constellation.yMax,
        constellation.yMax,
        (slot + Math.random()) / CONSTELLATION_COUNT
      );
      this.constellations.push(constellation);
      this.scene.add(constellation.group);
    }
  }

  /**
   * Track the new viewport. Figures already in flight keep their lanes and
   * drift out naturally; every respawn uses the new dimensions.
   */
  resize = (): void => {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    this.viewWidth = viewport.z;
    this.viewHeight = viewport.w;
    this.starMaterial.uniforms.uViewHeight.value = this.viewHeight;
    this.lineMaterial.uniforms.uViewHeight.value = this.viewHeight;
  };

  private nextTemplate(): FigureTemplate {
    if (this.bag.length === 0) {
      this.bag = Object.keys(TEMPLATES);
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return TEMPLATES[this.bag.pop() as string];
  }

  /**
   * Build a fresh figure in the given horizontal slot, positioned just below
   * the bottom of the viewport.
   */
  private spawn(slot: number): Constellation {
    const minDimension = Math.min(this.viewWidth, this.viewHeight);
    const figure = buildFigure(
      this.nextTemplate(),
      lerp(SCALE_MIN, SCALE_MAX, Math.random()) * minDimension
    );

    const group = new Group();
    group.add(this.buildStars(figure), this.buildLines(figure));

    // random x within the slot's lane, clamped so the figure stays on screen
    const laneWidth = this.viewWidth / CONSTELLATION_COUNT;
    const laneCenter = (slot + 0.5) * laneWidth - this.viewWidth / 2;
    const xPlay = Math.max(
      0,
      Math.min(
        laneWidth / 2,
        this.viewWidth / 2 - figure.halfWidth - EDGE_MARGIN
      ) - Math.abs(laneCenter)
    );
    group.position.x = laneCenter + (Math.random() * 2 - 1) * xPlay;

    const yMax = this.viewHeight / 2 + figure.halfHeight + EDGE_MARGIN;
    group.position.y = -yMax;

    const xMax = this.viewWidth / 2 + figure.halfWidth + EDGE_MARGIN;

    // same drift math as the field, pinned to far-field depth so figures
    // move with the slowest stars; the field plane spans 1.05 * viewHeight
    const zFactor = lerp(Z_FACTOR_MIN, 1, Math.random());
    const speed = FIELD_SPEED * (1 / zFactor) * 1.05 * this.viewHeight;

    return { group, speed, yMax, xMax, slot };
  }

  private buildStars(figure: Figure): Points {
    const positions: number[] = [];
    const phases: number[] = [];
    const magnitudes: number[] = [];
    for (const point of figure.points) {
      positions.push(point.x, point.y, 0);
      phases.push(Math.random() * TAU);
      magnitudes.push(Math.random());
    }
    const geometry = new BufferGeometry();
    geometry.attributes.position = new BufferAttribute(
      new Float32Array(positions),
      3
    );
    geometry.attributes.aPhase = new BufferAttribute(
      new Float32Array(phases),
      1
    );
    geometry.attributes.aMagnitude = new BufferAttribute(
      new Float32Array(magnitudes),
      1
    );
    return new Points(geometry, this.starMaterial);
  }

  private buildLines(figure: Figure): LineSegments {
    const positions: number[] = [];
    for (const [i, j] of figure.edges) {
      const a = figure.points[i];
      const b = figure.points[j];
      // trim both ends so lines stop short of the star cores
      const gap = Math.min(LINE_GAP, a.distanceTo(b) * 0.25);
      const direction = b.clone().sub(a).normalize();
      positions.push(a.x + direction.x * gap, a.y + direction.y * gap, 0);
      positions.push(b.x - direction.x * gap, b.y - direction.y * gap, 0);
    }
    const geometry = new BufferGeometry();
    geometry.attributes.position = new BufferAttribute(
      new Float32Array(positions),
      3
    );
    return new LineSegments(geometry, this.lineMaterial);
  }

  update = (delta: number): void => {
    this.time += delta;
    this.starMaterial.uniforms.uTime.value = this.time;

    for (let i = 0; i < this.constellations.length; i++) {
      const constellation = this.constellations[i];
      // 45-degree drift, matching the star field; x wraps around the sides
      constellation.group.position.y += constellation.speed * delta;
      constellation.group.position.x += constellation.speed * delta;
      if (constellation.group.position.x > constellation.xMax) {
        constellation.group.position.x = -constellation.xMax;
      }
      if (constellation.group.position.y > constellation.yMax) {
        // fully off the top: replace with a fresh figure below the viewport
        this.scene.remove(constellation.group);
        constellation.group.children.forEach((child) =>
          (child as Points | LineSegments).geometry.dispose()
        );
        const next = this.spawn(constellation.slot);
        this.scene.add(next.group);
        this.constellations[i] = next;
      }
    }
  };
}
