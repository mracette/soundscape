import * as THREE from "three-legacy";
import { SceneManager } from "../../SceneManager";
import { LandingPageParticles } from "../../subjects/LandingPageParticles";
import { LandingPageConstellations } from "../../subjects/LandingPageConstellations";
import { LandingPageFog } from "../../subjects/LandingPageFog";

export class LandingPageScene extends SceneManager {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    const opts = {
      dprMax: 2.5,
      resizeMethod: "fullscreen",
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
    subjects.constellations = new LandingPageConstellations(
      this.scene,
      this.renderer
    );
    subjects.fog = new LandingPageFog(this.scene, this.renderer);
    return subjects;
  }

  onWindowResize() {
    super.onWindowResize();
    // base resize only updates perspective fields; this scene's camera is
    // orthographic in viewport px, so the frustum must track the new size
    const camera = this.camera as unknown as THREE.OrthographicCamera;
    const { width, height } = this.sceneDimensions;
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();
    (this.subjects.particles as LandingPageParticles).resize();
    (this.subjects.constellations as LandingPageConstellations).resize();
    (this.subjects.fog as LandingPageFog).resize();
    this.render();
  }

  protected render() {
    // autoClear is off globally, and resize events can trigger extra renders
    // between composites; without an explicit clear, the semi-transparent fog
    // quads composite over themselves and flash brighter during drags
    this.renderer.clear();
    const delta = this.clock.getDelta();
    (this.subjects.particles as LandingPageParticles).update(delta);
    (this.subjects.constellations as LandingPageConstellations).update(delta);
    (this.subjects.fog as LandingPageFog).update(delta);
    this.renderer.render(this.scene, this.camera);
  }
}
