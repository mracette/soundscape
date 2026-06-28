import {
  Color,
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { applyColorParity } from "../colorPipeline";
import { SceneRuntime } from "../SceneRuntime";
import type { SignalSource } from "../signal";
import type { Source } from "../../../bindings";

declare global {
  interface Window {
    __blenderRuntime?: {
      ready: boolean;
      setSignal(v: number): void;
      tick(): number;
    };
  }
}

const canvas = document.getElementById(
  "blender-runtime-canvas"
) as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas, antialias: false });
renderer.setSize(256, 256, false);
applyColorParity(renderer);

const camera = new PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0, 4);

// Authoring scene: one emissive box carrying a binding in userData, exactly as
// a Blender export would. Round-tripped through glTF below so the test reads it
// back through GLTFLoader's extras->userData path.
function buildAuthoringScene(): Scene {
  const scene = new Scene();
  const mesh = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshStandardMaterial({
      color: 0x000000,
      emissive: new Color(0xffffff),
      emissiveIntensity: 0,
    })
  );
  mesh.name = "reactive";
  mesh.userData.soundscape = {
    bindings: [
      {
        target: { property: "emissiveIntensity" },
        source: { band: "bass", measure: "volume" },
        transform: { outMin: 0, outMax: 1 },
      },
    ],
  };
  scene.add(mesh);
  return scene;
}

let signalLevel = 0;
const harnessSource: SignalSource = { read: (_s: Source) => signalLevel };

async function main(): Promise<void> {
  const authoring = buildAuthoringScene();

  const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
    new GLTFExporter().parse(
      authoring,
      (result) => resolve(result as ArrayBuffer),
      (err) => reject(err),
      { binary: true }
    );
  });

  const gltf = await new Promise<GLTF>((resolve, reject) => {
    new GLTFLoader().parse(glb, "", resolve, reject);
  });

  const runtime = new SceneRuntime({
    scene: gltf.scene,
    animations: gltf.animations,
    signalSource: harnessSource,
  });

  const reactive = gltf.scene.getObjectByName("reactive") as Mesh;

  window.__blenderRuntime = {
    ready: true,
    setSignal: (v: number) => {
      signalLevel = v;
    },
    tick: () => {
      runtime.update(1 / 60);
      renderer.render(gltf.scene, camera);
      return (reactive.material as MeshStandardMaterial).emissiveIntensity;
    },
  };
}

main();
