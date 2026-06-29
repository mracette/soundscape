import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { validateUserData } from "../../../bindings";

declare global {
  interface Window {
    __blenderContract?: {
      ready: boolean;
      carrierIsMesh: boolean;
      userDataType: string;
      valid: boolean;
      errors: string[];
      error?: string;
    };
  }
}

async function main(): Promise<void> {
  try {
    const res = await fetch("/blender-contract.glb");
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const buf = await res.arrayBuffer();

    const gltf = await new Promise<GLTF>((resolve, reject) =>
      new GLTFLoader().parse(buf, "", resolve, reject)
    );

    let carrier: { userData: Record<string, unknown> } | undefined;
    gltf.scene.traverse((o) => {
      if (carrier === undefined && o.userData && o.userData.soundscape !== undefined) {
        carrier = o as unknown as { userData: Record<string, unknown> };
      }
    });

    const ud = carrier?.userData.soundscape;
    const result = validateUserData(ud);
    window.__blenderContract = {
      ready: true,
      carrierIsMesh: Boolean(
        carrier && (carrier as { isMesh?: boolean }).isMesh &&
          (carrier as { material?: unknown }).material
      ),
      userDataType: Object.prototype.toString.call(ud),
      valid: result.valid,
      errors: result.errors,
    };
  } catch (err) {
    window.__blenderContract = {
      ready: true,
      carrierIsMesh: false,
      userDataType: "error",
      valid: false,
      errors: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

main();
