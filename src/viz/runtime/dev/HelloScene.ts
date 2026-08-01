import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Color,
} from "three";
import { applyColorParity } from "../colorPipeline";

/** Cube color, interpreted as sRGB. */
export const HELLO_COLOR = 0x3366cc;

/**
 * Phase 0 proof of the parity color pipeline: an unlit cube of a known sRGB
 * color, rendered with Blender-"Standard" color management. The center pixel
 * reads back as ~HELLO_COLOR, confirming sRGB round-trips with no tone-map
 * distortion.
 *
 * This is a harness, NOT the production runtime (that arrives in a later
 * phase). It deliberately does not extend the legacy scene manager and imports
 * only modern `three`.
 */
export class HelloScene {
  readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly cube: Mesh;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    applyColorParity(this.renderer);
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(512, 512, false);

    this.camera = new PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.set(0, 0, 2);

    this.cube = new Mesh(
      new BoxGeometry(2.4, 2.4, 2.4),
      new MeshBasicMaterial({ color: new Color(HELLO_COLOR) })
    );
    this.scene.add(this.cube);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /** Read the framebuffer center pixel as [r,g,b,a] (0–255, sRGB-encoded). */
  readCenterPixel(): [number, number, number, number] {
    const gl = this.renderer.getContext();
    const x = Math.floor(gl.drawingBufferWidth / 2);
    const y = Math.floor(gl.drawingBufferHeight / 2);
    const px = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return [px[0], px[1], px[2], px[3]];
  }
}
