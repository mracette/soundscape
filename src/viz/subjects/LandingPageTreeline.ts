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

import { treelineTint } from "../../styles/settings";
import treelineUrl from "../img/landing/treeline.svg";

/**
 * Layered forest treeline along the bottom of the landing page: one vector
 * silhouette rendered twice — a hazy, smaller "far" line and a near-black
 * "near" line — so the horizon reads with depth. The SVG is rasterized to a
 * canvas at exactly the on-screen pixel size (per devicePixelRatio), so the
 * silhouette stays crisp at every viewport size and never ships 1x/2x
 * bitmap variants.
 */

/**
 * Source SVG dimensions, and the band of rows the trees actually occupy.
 * Produced by scripts/vectorize-treeline.sh — re-run it to get fresh values
 * when swapping the silhouette asset.
 */
const SVG_WIDTH = 1584;
const SVG_HEIGHT = 672;
const BAND_TOP = 213;
const BAND_HEIGHT = 411;
/** Tree band height as a fraction of its width. */
const BAND_ASPECT = BAND_HEIGHT / SVG_WIDTH;

/** Near treeline height: proportional to width, clamped for extreme aspects. */
const NEAR_HEIGHT_MIN_VH = 0.24;
const NEAR_HEIGHT_MAX_VH = 0.42;

interface TreelineLayer {
  /** Tree height relative to the near line. */
  scale: number;
  tint: string;
  blur: number;
  /**
   * Tree-band base height above the viewport bottom, as a fraction of near
   * height. The gap below is filled with solid tint, so a lifted layer never
   * shows background through it.
   */
  lift: number;
  /** Horizontal shift in tile widths, so peaks don't align across layers. */
  offset: number;
  opacity: number;
  renderOrder: number;
}

/**
 * Depth layers, nearest first. Each is the same silhouette at a different
 * size and haze level; lifts overlap the layers so no bare band of fog reads
 * as ground between them. Fog quads render at orders 2 (behind the mid and
 * near lines) and 5 (in front of everything).
 */
const LAYERS: TreelineLayer[] = [
  {
    scale: 0.8,
    tint: treelineTint,
    blur: 0,
    lift: 0.2,
    offset: 0,
    opacity: 1,
    renderOrder: 4,
  },
  {
    scale: 0.35,
    tint: treelineTint,
    blur: 2,
    lift: 0.35,
    offset: 0.5,
    opacity: 0.5,
    renderOrder: 3,
  },
];

const TEXTURE_MAX_WIDTH = 4096;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export class LandingPageTreeline {
  scene: Scene;
  renderer: WebGLRenderer;
  private entries: { mesh: Mesh; layer: TreelineLayer }[] = [];
  private svgText?: string;
  private rebuildTimer?: number;
  private buildToken = 0;
  private disposed = false;

  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    fetch(treelineUrl)
      .then((response) => response.text())
      .then((text) => {
        this.svgText = text;
        this.rebuild();
      });
  }

  /** Layer geometry for the current viewport, all sizes in whole px. */
  private layout(layer: TreelineLayer) {
    const viewport = new Vector4();
    this.renderer.getViewport(viewport);
    const viewWidth = viewport.z;
    const viewHeight = viewport.w;

    // Near line: height follows width, clamped so portrait phones still get
    // a presence and ultrawides don't drown in trees. When the clamp bites,
    // the silhouette shrinks and mirror-tiles across the width, so the full
    // band stays visible with its base on the viewport bottom. Whole-pixel
    // sizes keep the texture sampling 1:1 (no resampling softness).
    const nearHeight = Math.round(
      clamp(
        BAND_ASPECT * viewWidth,
        NEAR_HEIGHT_MIN_VH * viewHeight,
        NEAR_HEIGHT_MAX_VH * viewHeight,
      ),
    );

    const height = Math.round(layer.scale * nearHeight);
    const tileWidth = Math.round(height / BAND_ASPECT);
    // the mesh is a centered plane, so a phase-shifted layer needs the shift's
    // worth of extra width on BOTH sides — otherwise the right edge lands
    // offset·tileWidth/2 short of the viewport edge
    const width = Math.max(viewWidth, tileWidth) + 2 * layer.offset * tileWidth;
    const x = -layer.offset * tileWidth;
    // the lift gap below the tree band is part of the mesh, filled with
    // solid tint at raster time, so every layer runs unbroken to the
    // viewport bottom no matter what renders in front of it
    const pad = Math.round(layer.lift * nearHeight);
    const meshHeight = height + pad;
    const y = -viewHeight / 2 + meshHeight / 2;
    return { height, pad, meshHeight, tileWidth, width, x, y };
  }

  private place(mesh: Mesh, layer: TreelineLayer) {
    const { meshHeight, width, x, y } = this.layout(layer);
    mesh.scale.set(width, meshHeight, 1);
    mesh.position.set(x, y, 0);
  }

  /**
   * Load the silhouette at an explicit raster size. SVG-in-drawImage is
   * rasterized at the image's intrinsic size in some browsers, so the size
   * is written into the SVG tag itself and loaded via a blob URL — the only
   * reliable way to get a sharp vector raster at arbitrary resolution.
   */
  private loadAtSize(width: number, height: number): Promise<HTMLImageElement> {
    const sized = this.svgText!.replace(
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

  /**
   * Rasterize the tree band to a tinted canvas. `tileWidth`/`height` are the
   * on-screen px of one silhouette copy; copies are drawn mirrored
   * edge-to-edge until `totalWidth` is covered, so the strip tiles without a
   * visible seam.
   */
  private async rasterize(
    tileWidth: number,
    totalWidth: number,
    tint: string,
    blur: number,
    padBottom = 0,
  ): Promise<HTMLCanvasElement> {
    const dpr = Math.min(
      this.renderer.getPixelRatio(),
      TEXTURE_MAX_WIDTH / totalWidth,
    );
    const scale = (tileWidth * dpr) / SVG_WIDTH;
    const img = await this.loadAtSize(SVG_WIDTH * scale, SVG_HEIGHT * scale);

    const bandHeight = Math.round(BAND_HEIGHT * scale);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(totalWidth * dpr);
    canvas.height = bandHeight + Math.round(padBottom * dpr);
    const ctx = canvas.getContext("2d")!;

    if (blur > 0) ctx.filter = `blur(${blur * dpr}px)`;
    // integer stride, one px short of the tile width, so tiles overlap by a
    // pixel instead of drifting apart on fractional-dpr rounding (a visible
    // background-colored seam)
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
    if (padBottom > 0) {
      // solid skirt below the tree band; overlaps upward past the blur
      // falloff so no lighter seam shows at the junction
      const overlap = Math.ceil(blur * dpr * 2);
      ctx.fillRect(
        0,
        bandHeight - overlap,
        canvas.width,
        canvas.height - bandHeight + overlap,
      );
    }
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
   * Resize in two tiers: existing meshes are restretched to the new layout
   * immediately (cheap, keeps every frame of a drag coherent), and the full
   * re-rasterization — async, expensive, texture-swapping — runs once, after
   * the resize has settled.
   */
  resize = (): void => {
    if (!this.svgText) return;
    if (this.entries.length === 0) {
      this.rebuild();
      return;
    }
    for (const { mesh, layer } of this.entries) {
      this.place(mesh, layer);
    }
    window.clearTimeout(this.rebuildTimer);
    this.rebuildTimer = window.setTimeout(this.rebuild, 250);
  };

  /**
   * Stop future rebuilds. The debounced resize timer and the initial SVG
   * fetch both resolve into `rebuild()`, which would otherwise re-rasterize
   * and add meshes to a scene that has already been torn down. Mesh/texture
   * disposal itself is the scene's `disposeAll`'s job.
   */
  dispose(): void {
    this.disposed = true;
    window.clearTimeout(this.rebuildTimer);
    // invalidate any rasterization already in flight (token check in rebuild)
    this.buildToken++;
  }

  /** Re-rasterize every layer at the current viewport size and swap meshes. */
  private rebuild = (): void => {
    if (!this.svgText || this.disposed) return;
    const token = ++this.buildToken;

    Promise.all(
      LAYERS.map((layer) => {
        const { tileWidth, width, pad } = this.layout(layer);
        return this.rasterize(
          tileWidth,
          width,
          layer.tint,
          layer.blur,
          pad,
        ).then((canvas) => ({ layer, canvas }));
      }),
    ).then((built) => {
      // a newer rebuild started while this one rasterized — drop it
      if (token !== this.buildToken) return;

      this.entries.forEach(({ mesh }) => this.disposeMesh(mesh));

      this.entries = built.map(({ layer, canvas }) => {
        const mesh = this.buildMesh(canvas, layer.renderOrder, layer.opacity);
        this.place(mesh, layer);
        return { mesh, layer };
      });

      this.scene.add(...this.entries.map(({ mesh }) => mesh));
    });
  };
}
