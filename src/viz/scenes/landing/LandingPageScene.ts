import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import { LandingPageParticles } from "../../subjects/LandingPageParticles";

interface LandingPageExtras {
  spectrumFunction: (n: number) => string;
}

export class LandingPageScene extends SceneManager {
  constructor(canvas: HTMLCanvasElement, extras: LandingPageExtras) {
    super(canvas);
    const opts = {
      dprMax: 2.5,
      resizeMethod: "fullscreen",
      spectrumFunction: extras.spectrumFunction,
    };
    Object.assign(this, opts);
    super.init();
    this.animate();
  }

  initScene() {
    const scene = new THREE.Scene();
    return scene;
  }

  initCamera() {
    const viewport = new THREE.Vector4();
    this.renderer.getViewport(viewport);

    const camera = new THREE.OrthographicCamera(
      viewport.z / -2,
      viewport.z / 2,
      viewport.w / 2,
      viewport.w / -2,
      1,
      1000
    );

    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    return camera as unknown as THREE.PerspectiveCamera;
  }

  initSubjects() {
    const subjects: Record<string, unknown> = {};
    subjects.particles = new LandingPageParticles(
      this.scene,
      this.camera,
      this.renderer
    );
    return subjects;
  }

  protected render() {
    (this.subjects.particles as LandingPageParticles).update(
      this.clock.getDelta()
    );
    this.renderer.render(this.scene, this.camera);
  }
}
