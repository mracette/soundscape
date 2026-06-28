import { HelloScene } from "./HelloScene";

declare global {
  interface Window {
    __blenderHello?: { centerPixel: [number, number, number, number] };
  }
}

const canvas = document.getElementById(
  "blender-hello-canvas"
) as HTMLCanvasElement;

const scene = new HelloScene(canvas);
scene.render();
window.__blenderHello = { centerPixel: scene.readCenterPixel() };
