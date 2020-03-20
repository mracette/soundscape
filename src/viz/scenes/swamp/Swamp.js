// libs
import * as THREE from 'three';
import { SceneManager } from '../../SceneManager';
import FirstPersonControls from '../../controls/FirstPersonControls';
import { swamp } from '../../models/assetIndex';

// rendering

// shaders

export class Swamp extends SceneManager {

    constructor(canvas, analysers, callback, extras) {

        super(canvas);

        this.DPRMax = 5;
        this.songId = 'swamp';

        this.fovAdjust = true;
        this.fpcControl = true;

        this.renderList = ['swamp'];

        Promise.all([
            super.init(),
            this.loadModels(this.renderList)
        ]).then(() => {
            callback();
            this.applySceneSettings();
            super.animate();
        }).catch((err) => {
            console.log(err);
        });

    }

    applySceneSettings() {

        // this.renderer.shadowMap.enabled = false;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;

        this.renderer.setClearColor(0x000000, 0.0);

        // this.camera.position.set(-36.792147432025736, 12.295984744079584, 19.50565058881036);
        // this.camera.lookAt(46.69487932551039, 2.382592629313793, -34.638979984916375);
        // this.camera.fov = this.getNewFov(window.innerWidth / window.innerHeight);
        // this.camera.updateProjectionMatrix();

        this.onWindowResize()

    }

    getNewFov(aspectRatio) {
        const fovMin = 25;
        const fovMax = 50;
        const aspectMin = 0.5;
        const aspectMax = 3;
        const aspectAdj = Math.max(aspectMin, Math.min(aspectRatio, aspectMax));
        const newFov = fovMax - (fovMax - fovMin) * (aspectAdj - aspectMin) / (aspectMax - aspectMin);
        return newFov;
    }

    initControls() {

        const controls = {};

        if (this.fpcControl) {
            controls.fpc = new FirstPersonControls(this.camera);
        }

        return controls;

    }

    initScene() {

        const scene = new THREE.Scene();
        return scene;

    }

    initLights() {

        // return lights;

    }

    loadModels(modelList) {

        return new Promise((resolve, reject) => {

            const loadPromiseArray = [];

            // house and god rays
            modelList.indexOf('swamp') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.loadModel({ name: 'swamp', index: swamp, format: process.env.REACT_APP_ASSET_FORMAT }).then((model) => {
                        console.log(model);
                        this.scene.add(model.scene);
                        this.camera = model.cameras[0];
                        resolve();
                    });

                })
            );

            Promise.all(loadPromiseArray).then(() => {
                resolve();
            }).catch((err) => {
                reject(`Error loading models: ${err}`);
            });

        })

    }

    render(overridePause) {
        this.controls.fpc.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }

}