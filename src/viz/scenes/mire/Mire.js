// libs
import * as THREE from 'three';
import chroma from 'chroma-js';
import { SceneManager } from '../../SceneManager';
import FirstPersonControls from '../../controls/FirstPersonControls';

export class Mire extends SceneManager {

    constructor(canvas, analysers, callback, extras) {

        super(canvas);

        this.DPRMax = 2.25;
        this.fov = 20;
        // this.fovMin = 25;
        // this.fovMax = 50;
        // this.aspectMin = 0.5;
        // this.aspectMax = 3;
        this.spectrumFunction = extras.spectrumFunction;
        this.songId = 'mire';
        this.resizeMethod = 'cinematic';
        this.bpm = extras.bpm;
        this.renderList = 'mire';
        this.fovAdjust = false;
        this.fpcControl = false;

        this.colors = {
            // vine: chroma("#142A1F").darken(.8).hex(),
            vine: chroma("#010503").darken(.8).hex(),
            tree: chroma("#0A0805").darken(.085).hex(),
            fog: chroma("#cccccc").hex(),
            lily: chroma("LightPink").darken(4.5).hex(),
            chimney: chroma("#040404").darken(1).hex(),
            roof: chroma("#0E0F0C").hex(),
        }

        // this.rhythmAnalyser = analysers.find(a => a.id === 'rhythm-analyser');
        // this.atmosphereAnalyser = analysers.find(a => a.id === 'extras-analyser');
        // this.harmonyAnalyser = analysers.find(a => a.id === 'harmony-analyser');
        // this.melodyAnalyser = analysers.find(a => a.id === 'melody-analyser');
        // this.bassAnalyser = analysers.find(a => a.id === 'bass-analyser');

        super.init().then(() => {
            this.loadModels(this.renderList);
        }).then(() => {
            callback();
            // render once to get objects in place
            this.render(this.renderList);
            super.animate();
        }).catch((err) => {
            console.log(err);
        });

    }

    applySceneSettings() {

        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setClearColor(0x000000, 0);
        this.onWindowResize(this.resizeMethod);

    }

    preProcessSceneObjects(sceneObjects) {

        const lightIntensityAdj = 1 / 5;
        const vineMat = new THREE.MeshBasicMaterial({color: this.colors.vine});
        const treeMat = new THREE.MeshBasicMaterial({color: this.colors.tree});
        const lilyMat = new THREE.MeshBasicMaterial({color: this.colors.lily});
        const roofMat = new THREE.MeshBasicMaterial({color: this.colors.roof});
        const chimneyMat = new THREE.MeshBasicMaterial({color: this.colors.chimney});

        this.applyAll(sceneObjects, (obj) => {
            const type = obj.type.toLowerCase();
            const name = obj.name;
            if (type.includes('light')) {
                obj.intensity *= lightIntensityAdj;
            } else if (type.includes('camera')) {
                obj.fov = this.fov || 45;
                obj.updateProjectionMatrix();
            } else if (type.includes('mesh')) {
                if(name.includes('background')) {
                    console.log(obj);
                    obj.material = new THREE.MeshBasicMaterial({color: 0x000000});
                    obj.material.side = THREE.DoubleSide;
                } else if (name.includes('vine')) {
                    obj.material = vineMat;
                } else if (name.includes('tree') && obj.material.map === null) {
                    obj.material = treeMat;
                } else if (name.includes('flower')) {
                    obj.material = lilyMat;
                } else if (name.includes('roof')) {
                    obj.material = roofMat;
                } else if (name.includes('chimney')) {
                    obj.material = chimneyMat;
                }
            }
        })

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
        // scene.fog = new THREE.FogExp2(0xcccccc, .005);
        scene.fog = new THREE.Fog(this.colors.fog, 1, 280);
        return scene;

    }

    initLights() {

        const lights = {
            // ambient: new THREE.AmbientLight(0xffffff, 2),
            hemisphere: new THREE.HemisphereLight(0xffffff, 0xffffff, 10.5),
        }

        this.scene.add(lights.ambient, lights.hemisphere);

        return lights;

    }

    loadModels(modelList) {

        return new Promise((resolve, reject) => {

            const loadPromiseArray = []

            // paintings
            modelList.indexOf('mire') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.loadModel({ name: 'mire' }).then((model) => {
                        this.preProcessSceneObjects(model.scene)
                        this.scene.add(model.scene);
                        this.camera = model.cameras[0];
                        this.applySceneSettings();
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

        if (!this.pauseVisuals || overridePause) {

            this.elapsedBeats = this.bpm * this.clock.getElapsedTime() / 60;
            this.fpcControl && this.controls.fpc.update(this.clock.getDelta());
            this.renderer.render(this.scene, this.camera);

        }
    }

}