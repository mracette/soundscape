// libs
import * as THREE from 'three';
import { SceneManager } from '../../SceneManager';
import FirstPersonControls from '../../controls/FirstPersonControls';

// models
import houseModel from '../../models/mornings/house.glb';
import tableModel from '../../models/mornings/table.glb';
import flowerModel from '../../models/mornings/flowers.glb';
import spiralPlantModel from '../../models/mornings/spiral_plant.glb';
import bookcaseModel from '../../models/mornings/bookcase.glb';

// rendering
import { renderBass } from './renderBass';
import { renderRhythm } from './renderRhythm';

export class Mornings extends SceneManager {

    constructor(canvas, analysers, extras) {

        super(canvas);

        // after rendering these once, turn off auto-updates to optimize further renders
        this.staticObjects = [];

        this.spectrumFunction = extras.spectrumFunction;

        this.rhythmAnalyser = analysers.find(a => a.id === 'rhythm-analyser');
        this.atmosphereAnalyser = analysers.find(a => a.id === 'atmosphere-analyser');
        this.harmonyAnalyser = analysers.find(a => a.id === 'harmony-analyser');
        this.melodyAnalyser = analysers.find(a => a.id === 'melody-analyser');
        this.bassAnalyser = analysers.find(a => a.id === 'bass-analyser');

        this.fovAdjust = true;
        this.fpcControl = false;

        Promise.all([
            super.init(),
            this.loadModels()
        ]).then(() => {
            this.applySceneSettings();
            this.render(); // render once to get objects in place
            this.staticObjects.forEach(mesh => mesh.matrixAutoUpdate = false); // freeze static objects
            super.animate();
        }).catch((err) => {
            console.log(err);
        });

    }

    applySceneSettings() {

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        this.camera.position.set(-36.792147432025736, 12.295984744079584, 19.50565058881036);
        this.camera.lookAt(46.69487932551039, 2.382592629313793, -34.638979984916375);
        this.camera.fov = this.getNewFov(window.innerWidth / window.innerHeight);
        this.camera.updateProjectionMatrix();

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
        scene.background = new THREE.Color(0xcccccc);
        return scene;

    }

    initLights() {

        const MAPSIZE = 512;
        const CAMERASIZE = 20;
        const TILT = (10 / 180) * Math.PI;
        const OPP_RATIO = -1 * Math.sin(TILT);

        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, .35),
            sunlight: new THREE.DirectionalLight(0xffffff, 0),
            pointOne: new THREE.PointLight(0xffffff, .1)
        }

        const sunX = 20;
        const sunZ = -100
        const sunY = sunZ * OPP_RATIO;

        lights.sunlight.position.copy(new THREE.Vector3(sunX, sunY, sunZ));
        lights.sunlight.target.position.copy(new THREE.Vector3(sunX, 0, 0));
        lights.sunlight.castShadow = true;
        lights.sunlight.shadowBias = 0.0001;
        lights.sunlight.shadowMapHeight = MAPSIZE;
        lights.sunlight.shadowMapWidth = MAPSIZE;
        lights.sunlight.shadow.camera.top = CAMERASIZE;
        lights.sunlight.shadow.camera.bottom = -1 * CAMERASIZE;
        lights.sunlight.shadow.camera.left = -1 * CAMERASIZE;
        lights.sunlight.shadow.camera.right = CAMERASIZE;

        lights.pointOne.position.set(-36.792147432025736, 12.295984744079584, 19.50565058881036);
        lights.pointOne.castShadow = true;
        lights.pointOne.shadowBias = 0.0001;
        lights.pointOne.shadowMapHeight = MAPSIZE;
        lights.pointOne.shadowMapWidth = MAPSIZE;

        this.scene.add(lights.ambient);
        this.scene.add(lights.sunlight);
        this.scene.add(lights.sunlight.target);
        this.scene.add(lights.pointOne);

        return lights;

    }

    loadModels() {

        return new Promise((resolve, reject) => {

            const loadPromiseArray = []

            loadPromiseArray.push(

                // house and god rays
                new Promise((resolve, reject) => {

                    this.subjects.godrays = {};
                    this.subjects.godrays.materials = [];
                    this.subjects.godrays.meshes = [];

                    this.subjects.godrays.materials.push(new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        opacity: 0.05,
                        transparent: true,
                        side: THREE.DoubleSide
                    }));

                    this.helpers.gltfLoader.load(houseModel, (gltf) => {

                        gltf.scene.children.forEach((mesh) => {

                            // every mesh is static
                            this.staticObjects.push(mesh);

                            if (mesh.name === 'god_rays_top' || mesh.name === 'god_rays_bottom') {
                                mesh.material = this.subjects.godrays.materials[0];
                                this.subjects.godrays.meshes.push(mesh);
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

                    }, null, (err) => reject(err));

                }),

                // table
                new Promise((resolve, reject) => {

                    this.helpers.gltfLoader.load(tableModel, (gltf) => {

                        gltf.scene.children.forEach((mesh) => {

                            // every mesh is static
                            this.staticObjects.push(mesh);

                            mesh.castShadow = true;

                            if (mesh.name === 'table') {
                                mesh.receiveShadow = true;
                            }

                        });

                        this.scene.add(gltf.scene);

                        resolve();

                    }, null, () => reject())
                }),

                // flowers
                new Promise((resolve, reject) => {

                    this.helpers.gltfLoader.load(flowerModel, (gltf) => {

                        gltf.scene.children.forEach((mesh) => {

                            // every mesh is static
                            this.staticObjects.push(mesh);

                        })

                        this.scene.add(gltf.scene);
                        resolve();

                    }, null, () => reject())
                }),

                // spiral plant
                new Promise((resolve, reject) => {

                    this.helpers.gltfLoader.load(spiralPlantModel, (gltf) => {

                        this.scene.add(gltf.scene);

                        resolve();

                    }, null, () => reject())
                }),

                // bookshelf
                new Promise((resolve, reject) => {

                    // 3d array: columns, rows, books in cell
                    this.subjects.books = new Array(4).fill(null).map(d => new Array(5).fill(null).map(d => []));

                    this.helpers.gltfLoader.load(bookcaseModel, (gltf) => {

                        const pageMat = new THREE.MeshBasicMaterial({ color: 0xE7DACA, side: THREE.DoubleSide });

                        gltf.scene.children.forEach((mesh) => {

                            // every mesh is static
                            this.staticObjects.push(mesh);

                            if (mesh.name.includes('book') && mesh.type === 'Group') {

                                console.log(mesh);

                                const bookMesh = mesh.children.find(mesh => mesh.material.name.includes('book'));
                                const pageMesh = mesh.children.find(mesh => mesh.material.name.includes('page'));

                                pageMesh.material = pageMat;
                                bookMesh.material = new THREE.MeshBasicMaterial({
                                    side: THREE.DoubleSide
                                });

                                bookMesh.userData.baseColor = new THREE.Color(this.spectrumFunction(Math.random()));

                                const name = mesh.name;
                                const z = parseInt(name.slice(name.length - 1, name.length));
                                const y = parseInt(name.slice(name.length - 2, name.length - 1));
                                const x = parseInt(name.slice(name.length - 3, name.length - 2));
                                this.subjects.books[x][y][z] = bookMesh;

                            }

                        });

                        console.log(this.subjects.books);

                        this.scene.add(gltf.scene);

                        resolve();

                    }, null, (err) => reject(err))
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

        this.fpcControl && this.controls.fpc.update(this.clock.getDelta());

        renderBass(this.subjects.godrays, this.bassAnalyser, {
            sunlight: this.lights.sunlight
        });

        renderRhythm(this.subjects.books, this.rhythmAnalyser, {
            spectrumFunction: this.spectrumFunction
        });

        this.renderer.render(this.scene, this.camera);
    }

}