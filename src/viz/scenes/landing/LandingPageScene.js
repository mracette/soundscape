import * as THREE from "three";
import { Stars } from "../../subjects/Stars";
import { SceneManager } from "../../SceneManager";

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
    scene.background = new THREE.Color("#1f262f");
    return scene;
  }

  initCamera() {
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 1000;
    const aspect = this.sceneDimensions.width / this.sceneDimensions.height;
    let camera;
    camera = new THREE.PerspectiveCamera(fieldOfView, 1, nearPlane, farPlane);
    camera.aspect = aspect;
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    camera.updateProjectionMatrix();
    return camera;
  }

  initSubjects() {
    const subjects = {};
    subjects.stars = new Stars(this.scene, new THREE.Vector3(0, 0, 0), 1600, {
      colorPalette: this.spectrumFunction,
      minOrbitRadius: 300,
      maxOrbitRadius: 600,
    });
    return subjects;
  }

  render() {
    this.subjects.stars.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  }
}
