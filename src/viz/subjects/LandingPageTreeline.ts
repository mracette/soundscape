import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Scene,
  Vector4,
  WebGLRenderer,
} from "three";

// chroma-js has no bundled types; all chroma calls are typed as any
import chroma from "chroma-js";

import { treelineTint } from "../../styles/settings";
import treelineUrl from "../img/landing/treeline.svg";
import tree1Url from "../img/landing/trees/tree-1.svg";
import tree2Url from "../img/landing/trees/tree-2.svg";
import tree3Url from "../img/landing/trees/tree-3.svg";
import tree4Url from "../img/landing/trees/tree-4.svg";
import tree5Url from "../img/landing/trees/tree-5.svg";
import tree6Url from "../img/landing/trees/tree-6.svg";
import tree7Url from "../img/landing/trees/tree-7.svg";
import tree8Url from "../img/landing/trees/tree-8.svg";
import tree9Url from "../img/landing/trees/tree-9.svg";
import { channelAt, HORIZON_VH } from "./LandingPageWater";

/**
 * The forest of the landing page, in two parts sharing one channel geometry
 * with the water:
 *
 * - A hazy backdrop strip (the original treeline silhouette) standing on
 *   the horizon — the far wall of the woods.
 * - Banks of individual trees planted along both shorelines of the water
 *   channel, in depth rows that shrink, lighten, and blur as they recede
 *   toward the vanishing point — so the water reads as running into the
 *   forest and drawing the eye (and the viewer) with it.
 *
 * Everything is rasterized from vector silhouettes at exactly the
 * on-screen pixel size, so the trees stay crisp at every viewport size.
 */

/**
 * Backdrop strip source dimensions and tree-row band, from
 * scripts/vectorize-treeline.sh — re-run it when swapping the asset.
 */
const SVG_WIDTH = 1584;
const SVG_HEIGHT = 672;
const BAND_TOP = 213;
const BAND_HEIGHT = 411;
/** Tree band height as a fraction of its width. */
const BAND_ASPECT = BAND_HEIGHT / SVG_WIDTH;

/** Backdrop strip height: proportional to width, clamped for extreme aspects. */
const STRIP_HEIGHT_MIN_VH = 0.08;
const STRIP_HEIGHT_MAX_VH = 0.14;
/** Small solid skirt below the strip so no gap opens at the waterline. */
const STRIP_LIFT = 0.1;
const STRIP_BLUR = 2;
const STRIP_OPACITY = 0.6;

/** Width/height of each bank tree asset, in file order. */
const TREE_URLS = [
  tree1Url,
  tree2Url,
  tree3Url,
  tree4Url,
  tree5Url,
  tree6Url,
  tree7Url,
  tree8Url,
  tree9Url,
];
const TREE_ASPECTS = [
  0.321, 0.21, 0.443, 0.4, 0.479, 0.491, 0.225, 0.339, 0.423,
];

/**
 * Bank depth rows, far first (painter's order). t is channel depth: 0 at
 * the frame bottom, 1 at the horizon.
 */
const BANK_ROWS = [0.9, 0.75, 0.6, 0.45, 0.3, 0.15, 0.05];
/**
 * Bank tree heights (viewport fraction) at t = 0 / t = 1, interpolated
 * exponentially: the nearest trees tower in the corners and the sizes drop
 * off fast downstream — a linear ramp reads as a flat colonnade, not depth.
 */
const BANK_NEAR_HEIGHT = 0.5;
const BANK_FAR_HEIGHT = 0.03;
/** Distant rows fade toward this haze tone (aerial perspective). */
const BANK_HAZE = "#1d2735";
/**
 * The banks are hillsides: tree bases climb as they march outward from the
 * shoreline, damped with depth so the far rows stay level at the horizon.
 */
const HILL_RISE = 0.5;
/** The bare deciduous tree: an occasional accent, not a winter forest. */
const BARE_TREE = 7;
const BARE_TREE_CHANCE = 0.12;

const TEXTURE_MAX_WIDTH = 4096;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Deterministic PRNG: tree placement must survive a resize rebuild without
 * visibly reshuffling the forest.
 */
const mulberry32 = (seed: number) => (): number => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export class LandingPageTreeline {
  scene: Scene;
  renderer: WebGLRenderer;
  private meshes: Mesh[] = [];
  private stripText?: string;
  private treeTexts?: string[];
  private rebuildTimer?: number;
  private buildToken = 0;
  private disposed = false;

  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    Promise.all(
      [treelineUrl, ...TREE_URLS].map((url) =>
        fetch(url).then((response) => response.text()),
      ),
    ).then(([strip, ...trees]) => {
      this.stripText = strip;
      this.treeTexts = trees;
      this.rebuild();
    });
  }

  private viewSize() {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    return { viewWidth: viewport.z, viewHeight: viewport.w };
  }

  /**
   * Load an SVG at an explicit raster size. SVG-in-drawImage is rasterized
   * at the image's intrinsic size in some browsers, so the size is written
   * into the SVG tag itself and loaded via a blob URL — the only reliable
   * way to get a sharp vector raster at arbitrary resolution.
   */
  private loadAtSize(
    svgText: string,
    width: number,
    height: number,
  ): Promise<HTMLImageElement> {
    const sized = svgText.replace(
      /width="[^"]+" height="[^"]+"/,
      `width="${width}" height="${height}"`,
    );
    const blob = new Blob([sized], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /** Backdrop strip geometry for the current viewport, in whole px. */
  private stripLayout() {
    const { viewWidth, viewHeight } = this.viewSize();
    const height = Math.round(
      clamp(
        0.38 * BAND_ASPECT * viewWidth,
        STRIP_HEIGHT_MIN_VH * viewHeight,
        STRIP_HEIGHT_MAX_VH * viewHeight,
      ),
    );
    const tileWidth = Math.round(height / BAND_ASPECT);
    const width = Math.max(viewWidth, tileWidth);
    const pad = Math.round(STRIP_LIFT * height);
    const meshHeight = height + pad;
    const horizon = Math.round(HORIZON_VH * viewHeight);
    // the strip stands on the horizon; its skirt dips just below so the
    // junction with the water never opens into a background seam
    const y = -viewHeight / 2 + horizon - pad + meshHeight / 2;
    return { height, pad, meshHeight, tileWidth, width, y };
  }

  /** Rasterize the backdrop strip band, mirror-tiled across the width. */
  private async rasterizeStrip(): Promise<HTMLCanvasElement> {
    const { pad, tileWidth, width } = this.stripLayout();
    const dpr = Math.min(
      this.renderer.getPixelRatio(),
      TEXTURE_MAX_WIDTH / width,
    );
    const scale = (tileWidth * dpr) / SVG_WIDTH;
    const img = await this.loadAtSize(
      this.stripText!,
      SVG_WIDTH * scale,
      SVG_HEIGHT * scale,
    );

    const bandHeight = Math.round(BAND_HEIGHT * scale);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * dpr);
    canvas.height = bandHeight + Math.round(pad * dpr);
    const ctx = canvas.getContext("2d")!;

    ctx.filter = `blur(${STRIP_BLUR * dpr}px)`;
    // integer stride, one px short of the tile width, so tiles overlap by a
    // pixel instead of drifting apart on fractional-dpr rounding
    const stride = Math.max(1, Math.floor(tileWidth * dpr) - 1);
    const tiles = Math.ceil(canvas.width / stride);
    for (let i = 0; i < tiles; i++) {
      ctx.save();
      ctx.translate(i * stride, -BAND_TOP * scale);
      if (i % 2 === 1) {
        // mirror odd tiles so left/right edges always meet their own reflection
        ctx.translate(tileWidth * dpr, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }

    ctx.filter = "none";
    const overlap = Math.ceil(STRIP_BLUR * dpr * 2);
    ctx.fillRect(
      0,
      bandHeight - overlap,
      canvas.width,
      canvas.height - bandHeight + overlap,
    );
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = treelineTint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
  }

  /**
   * Rasterize the banks: rows of individual trees planted along both
   * shorelines, far rows first so near rows paint over them. Each row is
   * drawn black on a scratch canvas, tinted, then composited with a blur
   * that grows with depth.
   */
  private async rasterizeBanks(): Promise<HTMLCanvasElement> {
    const { viewWidth, viewHeight } = this.viewSize();
    const dpr = Math.min(
      this.renderer.getPixelRatio(),
      TEXTURE_MAX_WIDTH / viewWidth,
    );
    const horizon = HORIZON_VH * viewHeight;

    // rasterize each tree once at the tallest size it will be drawn, then
    // scale down per row — the down-scale softness disappears under the
    // depth blur
    const maxHeight = Math.ceil(BANK_NEAR_HEIGHT * 1.35 * viewHeight * dpr);
    const treeImages = await Promise.all(
      this.treeTexts!.map((text, i) =>
        this.loadAtSize(text, maxHeight * TREE_ASPECTS[i], maxHeight),
      ),
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewWidth * dpr);
    canvas.height = Math.round(viewHeight * dpr);
    const ctx = canvas.getContext("2d")!;

    const scratch = document.createElement("canvas");
    scratch.width = canvas.width;
    scratch.height = canvas.height;
    const sctx = scratch.getContext("2d")!;

    const rand = mulberry32(7);
    for (const t of BANK_ROWS) {
      sctx.globalCompositeOperation = "source-over";
      sctx.clearRect(0, 0, scratch.width, scratch.height);

      const { center, halfWidth } = channelAt(t);
      const rowHeight =
        BANK_NEAR_HEIGHT *
        Math.pow(BANK_FAR_HEIGHT / BANK_NEAR_HEIGHT, t) *
        viewHeight;
      const shoreY = t * horizon;

      for (const dir of [-1, 1]) {
        const shoreX = (center + dir * halfWidth) * viewWidth;
        let x = shoreX;
        while (x > -rowHeight && x < viewWidth + rowHeight) {
          let pick = Math.floor(rand() * treeImages.length);
          if (pick === BARE_TREE && rand() > BARE_TREE_CHANCE) {
            pick = (pick + 1 + Math.floor(rand() * 8)) % 9;
          }
          const h = rowHeight * (0.7 + 0.6 * rand());
          const w = h * TREE_ASPECTS[pick];
          // trunks sink slightly below the shoreline, so bases sit in the
          // water's shore feather instead of on a straight line
          const sink = (0.06 + 0.12 * rand()) * rowHeight;
          const hill =
            (Math.abs(x - shoreX) / viewWidth) * HILL_RISE * (1 - t) * viewHeight;
          const baseY =
            shoreY + hill - sink + (rand() - 0.5) * 0.1 * rowHeight;
          const drawY = (viewHeight - baseY - h) * dpr;
          const mirror = rand() < 0.5;

          sctx.save();
          sctx.translate((x + (mirror ? w / 2 : -w / 2)) * dpr, drawY);
          if (mirror) sctx.scale(-1, 1);
          sctx.drawImage(treeImages[pick], 0, 0, w * dpr, h * dpr);
          sctx.restore();

          x += dir * w * (0.45 + 0.35 * rand());
        }
      }

      // hero trees: one guaranteed giant anchoring each frame edge, so the
      // corner framing never depends on placement luck
      if (t === BANK_ROWS[BANK_ROWS.length - 1]) {
        for (const [anchorX, pick] of [
          [0.05, 0],
          [0.95, 6],
        ] as const) {
          const h = rowHeight * 1.3;
          const w = h * TREE_ASPECTS[pick];
          sctx.drawImage(
            treeImages[pick],
            (anchorX * viewWidth - w / 2) * dpr,
            (viewHeight - h + 0.03 * viewHeight) * dpr,
            w * dpr,
            h * dpr,
          );
        }
      }

      sctx.globalCompositeOperation = "source-in";
      sctx.fillStyle = chroma
        .mix(treelineTint, BANK_HAZE, Math.pow(t, 1.2) * 0.55)
        .css();
      sctx.fillRect(0, 0, scratch.width, scratch.height);

      ctx.filter = t > 0.45 ? `blur(${t * 0.9 * dpr}px)` : "none";
      ctx.drawImage(scratch, 0, 0);
      ctx.filter = "none";
    }

    return canvas;
  }

  private buildMesh(
    canvas: HTMLCanvasElement,
    renderOrder: number,
    opacity = 1,
  ): Mesh {
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      opacity,
    });
    const mesh = new Mesh(new PlaneBufferGeometry(1, 1), material);
    mesh.renderOrder = renderOrder;
    return mesh;
  }

  private disposeMesh(mesh?: Mesh) {
    if (!mesh) return;
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    const material = mesh.material as MeshBasicMaterial;
    material.map?.dispose();
    material.dispose();
  }

  /**
   * Resize re-rasterizes everything — async, expensive, texture-swapping —
   * once, after the resize has settled. (Stretching the old raster in the
   * interim would shear the perspective, so the previous frame just holds.)
   */
  resize = (): void => {
    if (!this.stripText) return;
    window.clearTimeout(this.rebuildTimer);
    this.rebuildTimer = window.setTimeout(this.rebuild, 250);
  };

  /**
   * Stop future rebuilds. The debounced resize timer and the initial SVG
   * fetches both resolve into `rebuild()`, which would otherwise
   * re-rasterize and add meshes to a scene that has already been torn
   * down. Mesh/texture disposal itself is the scene's `disposeAll`'s job.
   */
  dispose(): void {
    this.disposed = true;
    window.clearTimeout(this.rebuildTimer);
    // invalidate any rasterization already in flight (token check in rebuild)
    this.buildToken++;
  }

  /** Re-rasterize strip and banks at the current viewport size. */
  private rebuild = (): void => {
    if (!this.stripText || !this.treeTexts || this.disposed) return;
    const token = ++this.buildToken;
    const { viewWidth, viewHeight } = this.viewSize();

    Promise.all([this.rasterizeStrip(), this.rasterizeBanks()]).then(
      ([stripCanvas, bankCanvas]) => {
        // a newer rebuild started while this one rasterized — drop it
        if (token !== this.buildToken) return;

        this.meshes.forEach((mesh) => this.disposeMesh(mesh));

        const strip = this.buildMesh(stripCanvas, 2.6, STRIP_OPACITY);
        const { meshHeight, width, y } = this.stripLayout();
        strip.scale.set(width, meshHeight, 1);
        strip.position.set(0, y, 0);

        const banks = this.buildMesh(bankCanvas, 4);
        banks.scale.set(viewWidth, viewHeight, 1);
        banks.position.set(0, 0, 0);

        this.meshes = [strip, banks];
        this.scene.add(strip, banks);
      },
    );
  };
}
