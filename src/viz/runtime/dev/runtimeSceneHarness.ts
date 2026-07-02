import {
  BoxGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { RuntimeScene } from "../RuntimeScene";
import { BakedSignalSource } from "../bakedSignal";
import type { BakeResult } from "../bake/bakeSignal";
import type { SignalSource } from "../signal";
import type { Source } from "../../../bindings";

declare global {
  interface Window {
    __runtimeScene?: {
      loaded: boolean;
      setLevel(v: number): void;
      sample(): number;
      setBakedPosition(sec: number): void;
      sampleBaked(): number;
    };
  }
}

// Two bound cubes round-tripped through glTF (GLTFExporter -> the loader inside
// RuntimeScene), each driving position.y so the Playwright spec can read the
// value straight off the object. "scripted" is fed by a page-controlled level;
// "baked" is fed by a synthetic 2-frame bake whose playback position the page
// advances. This proves both signal-source shapes move bindings through the
// real RuntimeScene host without Blender or audio.
function buildAuthoringScene(): Scene {
  const scene = new Scene();

  const scripted = boundCube("scripted", "bass");
  scene.add(scripted);

  const baked = boundCube("baked", "baked");
  baked.position.x = 2;
  scene.add(baked);

  return scene;
}

function boundCube(name: string, band: string): Mesh {
  const mesh = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshStandardMaterial({ color: new Color(0x808080) })
  );
  mesh.name = name;
  mesh.userData.soundscape = {
    bindings: [
      {
        target: { property: "position.y" },
        source: { band, measure: "volume" },
        transform: { outMin: 0, outMax: 1 },
      },
    ],
  };
  return mesh;
}

// fps 2: frame centers at 0.25s and 0.75s. position 0 interpolates the wrapped
// pair (0.5), position 0.75 lands on the loud frame (1.0) — a clear, stable gap.
const twoFrameBake: BakeResult = {
  fps: 2,
  sampleRate: 44100,
  durationSec: 1,
  band: "baked",
  frames: [
    { volume: 0, buckets: [], onset: 0 },
    { volume: 1, buckets: [], onset: 0 },
  ],
};

let scriptedLevel = 0;
let bakedPosition = 0;

const baked = new BakedSignalSource(() => ({
  baked: [{ bake: twoFrameBake, positionSec: bakedPosition, weight: 1 }],
}));

const source: SignalSource = {
  update: () => baked.update(),
  read: (s: Source) => (s.band === "baked" ? baked.read(s) : scriptedLevel),
};

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
  const url = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));

  const canvas = document.getElementById(
    "runtime-scene-canvas"
  ) as HTMLCanvasElement;

  const runtimeScene = new RuntimeScene(canvas, {
    url,
    signalSource: source,
    onLoaded: () => {
      window.__runtimeScene!.loaded = true;
    },
  });

  window.__runtimeScene = {
    loaded: false,
    setLevel: (v: number) => {
      scriptedLevel = v;
    },
    sample: () => runtimeScene.getObjectByName("scripted")?.position.y ?? NaN,
    setBakedPosition: (sec: number) => {
      bakedPosition = sec;
    },
    sampleBaked: () => runtimeScene.getObjectByName("baked")?.position.y ?? NaN,
  };
}

main().catch((err) => console.error(err));
