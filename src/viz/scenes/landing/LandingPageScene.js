import * as THREE from "three";
import { Stars } from "../../subjects/Stars";
import { SceneManager } from "../../SceneManager";
import { ColorPalette } from "color-curves";

export class LandingPageScene extends SceneManager {
  constructor(canvas) {
    super(canvas);
    this.DPRMax = 2.5;
  }

    constructor(canvas) {
        super(canvas);
        this.DPRMax = 2.5;
        this.resizeMethod = 'fullscreen';
    }

  initCamera() {
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 1000;
    const aspect = this.screenDimensions.width / this.screenDimensions.height;
    let camera;
    camera = new THREE.PerspectiveCamera(fieldOfView, 1, nearPlane, farPlane);
    camera.aspect = aspect;
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    camera.updateProjectionMatrix();
    return camera;
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

  render() {
    this.subjects.stars.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  }
}
