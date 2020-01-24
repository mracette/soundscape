// libs
import * as THREE from 'three';
import { SceneManager } from '../SceneManager';

// models
import houseModel from '../models/mornings/house.glb';
import tableModel from '../models/mornings/table.glb';

export class Mornings extends SceneManager {

    constructor(canvas) {

        super(canvas);

        Promise.all([
            super.init(),
            this.loadModels()
        ]).then(() => {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
            console.log(this.scene);
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

        const MAPSIZE = 2048;
        const CAMERASIZE = 100;

        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, .5),
            sunlight: new THREE.DirectionalLight(0xffffff, 1)
        }

        lights.sunlight.position.copy(new THREE.Vector3(20, 20, -100));
        lights.sunlight.target.position.copy(new THREE.Vector3(20, 0, 0));
        lights.sunlight.castShadow = true;
        lights.sunlight.shadowBias = 0.0001;
        lights.sunlight.shadowMapHeight = MAPSIZE;
        lights.sunlight.shadowMapWidth = MAPSIZE;
        lights.sunlight.shadow.camera.top = CAMERASIZE;
        lights.sunlight.shadow.camera.bottom = -1 * CAMERASIZE;
        lights.sunlight.shadow.camera.left = -1 * CAMERASIZE;
        lights.sunlight.shadow.camera.right = CAMERASIZE;
        lights.sunlight.shadow.camera.near = 0.5;    // default
        lights.sunlight.shadow.camera.far = 500;     // default

        var helper = new THREE.CameraHelper(lights.sunlight.shadow.camera);
        this.scene.add(helper);

        this.scene.add(lights.ambient);
        this.scene.add(lights.sunlight);
        this.scene.add(lights.sunlight.target);

        this.lights = lights;
    }

    loadModels() {

        return new Promise((resolve, reject) => {

            const loadPromiseArray = []

            loadPromiseArray.push(

                // house and god rays
                new Promise((resolve, reject) => {
                    this.helpers.gltfLoader.load(houseModel, (gltf) => {
                        gltf.scene.children.forEach((mesh) => {
                            if (mesh.name === 'god_rays_top' || mesh.name === 'god_rays_bottom') {
                                mesh.material = new THREE.MeshBasicMaterial({
                                    color: 0xffffff,
                                    opacity: 0.05,
                                    transparent: true,
                                    side: THREE.DoubleSide
                                });
                            }
                            if (mesh.name === 'house_window_structure' || mesh.name === 'house_walls') {
                                mesh.castShadow = true;
                            }
                            if (mesh.name === 'house_floor') {
                                mesh.receiveShadow = true;
                            }
                        });
                        this.scene.add(gltf.scene);
                        resolve();
                    }, null, (err) => reject(err))
                }),

                // table
                new Promise((resolve, reject) => {
                    this.helpers.gltfLoader.load(tableModel, (gltf) => {
                        console.log(gltf);
                        gltf.scene.children.forEach((mesh) => {
                            mesh.castShadow = true;
                            if (mesh.name === 'table') {
                                mesh.receiveShadow = true;
                            }
                        });
                        this.scene.add(gltf.scene);
                        resolve();
                    }, null, () => reject())
                })
            );

            Promise.all(loadPromiseArray).then(() => {
                resolve();
            }).catch((err) => {
                reject(`Error loading models: ${err}`);
            });

        })

    }

    render() {
        this.controls.fpc.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }

}