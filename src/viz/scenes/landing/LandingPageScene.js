import * as THREE from 'three';
import { Stars } from '../../subjects/Stars';
import { SceneManager } from '../../SceneManager';
import { ColorPalette } from 'color-curves'

export class LandingPageScene extends SceneManager {

    initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#1f262f');
        return scene;
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

    initSubjects() {
        const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.182,"y":-0.138},"scale":{"x":1,"y":1},"rotation":0,"angleStart":2.105,"angleEnd":6.283,"angleOffset":0,"radius":0.5}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":-0.003,"y":0.758},"scale":{"x":1.053,"y":-0.13},"rotation":0}', '{"start":0,"end":1}');
        const subjects = {};
        subjects.stars = new Stars(
            this.scene,
            new THREE.Vector3(0, 0, 0),
            1000, {
            colorPalette: (n) => palette.rgbValueAt(n),
            minOrbitRadius: 200,
            maxOrbitRadius: 1000
        }
        );
        this.scene.add(subjects.stars);
        return subjects;
    }

    render() {
        this.subjects.stars.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }

}