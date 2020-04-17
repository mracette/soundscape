// libs
import * as THREE from 'three';
import { SceneManager } from '../../SceneManager';
import FirstPersonControls from '../../controls/FirstPersonControls';

// rendering

// shaders

export class Mire extends SceneManager {

    constructor(canvas, analysers, callback, extras) {

        super(canvas);

        this.DPRMax = 5;
        this.songId = 'mire';

        this.fovAdjust = false;
        this.fpcControl = false;
        this.resizeMethod = 'cinematic'

        this.renderList = ['swamp'];

        super.init().then(() => {
            this.loadModels(this.renderList).then(() => {
            callback();
            this.applySceneSettings();
            super.animate();
        }).catch((err) => {
            console.log(err);
        });
        });

    }

    applySceneSettings() {

        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_ssao.html

        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;

        this.renderer.setClearColor(0x000000, 0.0);

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

        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, .5)
        }
        this.scene.add(lights.ambient);
        this.lights = lights;
    }


    preProcessSceneObjects(sceneObjects) {

        const lightIntensityAdj = 1 / 10;

        this.applyAll(sceneObjects, (obj) => {
            if (obj.type.toLowerCase().includes('light')) {
                obj.intensity *= lightIntensityAdj;
                obj.castShadow = true;
                console.log(obj);
            } else if (obj.type === 'Mesh') {
                obj.material.side = THREE.DoubleSide;
                // obj.material.map.minFilter = THREE.LinearFilter;
                // obj.castShadow = true;
                // obj.receiveShadow = true;
            }
        })

    }

    loadModels(modelList) {

        return new Promise((resolve, reject) => {

            const loadPromiseArray = [];

            modelList.indexOf('swamp') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {
                    this.loadModel({ name: 'swamp-v3-test' }).then((model) => {
                        console.log(model);
                        this.preProcessSceneObjects(model.scene)
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
        // this.controls.fpc.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }

}