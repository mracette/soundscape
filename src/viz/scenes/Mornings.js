/* eslint-disable */

import { SceneManager } from '../SceneManager';
import * as THREE from 'three';
import houseModel from '../models/mornings/house.glb';

export class Mornings extends SceneManager {

    constructor(canvas) {

        super(canvas);

        Promise.all([
            super.init(),
            this.loadModels()
        ]).then(() => {
            super.animate()
        }).catch((err) => {
            console.log(err);
        });

    }

    initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcccccc);
        return scene;
    }

    initLights() {
        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, .5)
        }
        this.scene.add(lights.ambient);
        this.lights = lights;
    }

    loadModels() {

        return new Promise((resolve, reject) => {

            const loadPromiseArray = []

            loadPromiseArray.push(
                new Promise((resolve, reject) => {
                    this.helpers.gltfLoader.load(houseModel, (gltf) => {
                        console.log(gltf);
                        this.scene.add(gltf.scene);
                        // gltf.scene.getObjectByName('Spot').children[0].intensity = .1;
                        // gltf.scene.getObjectByName('Sun').children[0].intensity = 10;
                        // gltf.scene.children.filter(obj => obj.type === 'Mesh').map((mesh) => {
                        //     mesh.castShadow = true;
                        //     mesh.receiveShadow = true;
                        // });
                        resolve();
                    }, null, (err) => reject(err))
                })
            );

            Promise.all(loadPromiseArray).then(() => {
                resolve();
            }).catch(() => {
                reject('Error loading models');
            });

        })

    }

    render() {
        this.controls.fpc.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }

}