import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import { LandingPageParticles } from "../../subjects/LandingPageParticles";

export class LandingPageScene extends SceneManager {
  constructor(canvas, extras) {
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

    return camera;
  }

  initSubjects() {
    const subjects = {};
    subjects.particles = new LandingPageParticles(
      this.scene,
      this.camera,
      this.renderer
    );
    return subjects;
  }

  render() {
    this.subjects.particles.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  }
}
