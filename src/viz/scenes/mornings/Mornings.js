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
import paintingsModel from '../../models/mornings/paintings.glb';

// rendering
import { renderBass } from './renderBass';
import { renderRhythm } from './renderRhythm';
import { renderHarmony } from './renderHarmony';
import { renderMelody } from './renderMelody';

// shaders
import { rgbaVertex, rgbaFragment } from '../../shaders/rgba';

export class Mornings extends SceneManager {

    constructor(canvas, analysers, callback, extras) {

        super(canvas);

        this.DPRMax = 1.15;

        this.colors = {
            plant: new THREE.Color(0x7B9E53),
            white: new THREE.Color(0xFFFFFF),
            paleBlue: new THREE.Color(0xDEEEFF),
            coffee: new THREE.Color(0x260e00),
            deepBlue: new THREE.Color(0x213058),
            blueGrey: new THREE.Color(0xB0B1B6)
        };

        // after rendering these once, turn off auto-updates to optimize further renders
        this.staticObjects = [];
        this.renderList = [
            'house', 'plant', 'table', 'bookshelf', 'flower'
            // 'table'
        ];
        this.spectrumFunction = extras.spectrumFunction;
        this.bpm = extras.bpm;

        this.rhythmAnalyser = analysers.find(a => a.id === 'rhythm-analyser');
        this.atmosphereAnalyser = analysers.find(a => a.id === 'atmosphere-analyser');
        this.harmonyAnalyser = analysers.find(a => a.id === 'harmony-analyser');
        this.melodyAnalyser = analysers.find(a => a.id === 'melody-analyser');
        this.bassAnalyser = analysers.find(a => a.id === 'bass-analyser');

        this.fovAdjust = true;
        this.fpcControl = false;

        Promise.all([
            super.init(),
            this.loadModels(this.renderList)
        ]).then(() => {
            callback();
            this.applySceneSettings();
            this.render(this.renderList); // render once to get objects in place
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
        lights.sunlight.shadow.bias = 0.0001;
        lights.sunlight.shadow.mapSize.height = MAPSIZE;
        lights.sunlight.shadow.mapSize.width = MAPSIZE;
        lights.sunlight.shadow.camera.top = CAMERASIZE;
        lights.sunlight.shadow.camera.bottom = -1 * CAMERASIZE;
        lights.sunlight.shadow.camera.left = -1 * CAMERASIZE;
        lights.sunlight.shadow.camera.right = CAMERASIZE;

        lights.pointOne.position.set(-36.792147432025736, 12.295984744079584, 19.50565058881036);
        lights.pointOne.castShadow = true;
        lights.pointOne.shadow.bias = 0.0001;
        lights.pointOne.shadow.mapSize.height = MAPSIZE;
        lights.pointOne.shadow.mapSize.Width = MAPSIZE;

        this.scene.add(lights.ambient);
        this.scene.add(lights.sunlight);
        this.scene.add(lights.sunlight.target);
        this.scene.add(lights.pointOne);

        return lights;

    }

    loadModels(modelList) {

        return new Promise((resolve, reject) => {

            const loadPromiseArray = []

            // house and god rays
            modelList.indexOf('house') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.subjects.godrays = {};
                    this.subjects.godrays.materials = [];
                    this.subjects.godrays.meshes = [];

                    this.subjects.godrays.materials.push(new THREE.MeshBasicMaterial({
                        color: this.colors.white,
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

                            if (mesh.name === 'house_floor' || mesh.name === 'carpet') {
                                mesh.receiveShadow = true;
                            }

                        });

                        this.scene.add(gltf.scene);
                        resolve();

                    }, null, (err) => reject(err));

                })
            );

            // paintings
            modelList.indexOf('house') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.helpers.gltfLoader.load(paintingsModel, (gltf) => {

                        console.log(gltf);

                        gltf.scene.children.forEach((mesh) => {

                            // every mesh is static
                            this.staticObjects.push(mesh);

                            mesh.name === 'vonnegut_self_portrait' && (mesh.material.side = THREE.FrontSide);
                            mesh.name === 'van_gogh' && (mesh.material.side = THREE.BackSide);

                        });

                        this.scene.add(gltf.scene);
                        resolve();

                    }, null, (err) => reject(err));

                })
            );

            // table
            modelList.indexOf('table') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.helpers.gltfLoader.load(tableModel, (gltf) => {

                        const pageGeo = new THREE.PlaneBufferGeometry(1.9, 1.8, 64, 64);
                        pageGeo.rotateX(-Math.PI / 2);

                        gltf.scene.children.forEach((mesh) => {

                            console.log(mesh);
                            if (mesh.name.includes('mug_coffee')) {
                                mesh.material = new THREE.MeshBasicMaterial({
                                    color: this.colors.coffee
                                })
                            }

                            if (mesh.name.includes('mug_top')) {
                                mesh.material.color = new THREE.Color(0x666666);
                            }

                            if (mesh.name === 'left_page_ref' || mesh.name === 'right_page_ref') {

                                const colors = new Array(pageGeo.attributes.position.count * 4)

                                const newMesh = mesh.clone();
                                newMesh.geometry = pageGeo.clone();
                                newMesh.geometry.addAttribute('customColor', new THREE.Float32BufferAttribute(colors, 4));
                                newMesh.material = new THREE.ShaderMaterial({
                                    transparent: true,
                                    side: THREE.DoubleSide,
                                    vertexShader: rgbaVertex,
                                    fragmentShader: rgbaFragment,
                                    vertexColors: THREE.VertexColors
                                })

                                this.scene.add(newMesh);

                                mesh.name === 'right_page_ref' && (this.subjects.rightPage = newMesh);
                                mesh.name === 'left_page_ref' && (this.subjects.leftPage = newMesh);

                            }

                            if (mesh.name === 'steam') {
                                mesh.material = new THREE.MeshBasicMaterial({
                                    color: this.colors.white,
                                    transparent: true,
                                    side: THREE.DoubleSide,
                                    opacity: .025
                                })
                                this.subjects.steam = mesh;
                            } else {
                                // every mesh is static except steam
                                this.staticObjects.push(mesh);
                            }

                            mesh.castShadow = true;

                            if (mesh.name === 'table') {
                                mesh.receiveShadow = true;
                            }

                        });

                        gltf.scene.children.filter(c => c.name.includes('page')).forEach(mesh => gltf.scene.remove(mesh));
                        this.scene.add(gltf.scene);

                        resolve();

                    }, null, (err) => reject(err))
                })
            );

            // flowers
            modelList.indexOf('flower') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    const stickLeaves = [];
                    const stickLeavesOne = [];

                    this.helpers.gltfLoader.load(flowerModel, (gltf) => {

                        gltf.scene.children.forEach((mesh) => {

                            // every mesh is static
                            this.staticObjects.push(mesh);

                            if (mesh.name.includes('stick_leaves_one')) {
                                mesh.material = new THREE.MeshLambertMaterial({
                                    color: this.colors.plant,
                                    emissive: this.colors.plant,
                                    emissiveIntensity: 0
                                })
                                stickLeavesOne.push(mesh);
                            } else if (mesh.name.includes('stick_leaves')) {
                                mesh.material = new THREE.MeshLambertMaterial({
                                    color: this.colors.plant,
                                    emissive: this.colors.plant,
                                    emissiveIntensity: 0
                                })
                                stickLeaves.push(mesh);
                            }

                        })

                        this.subjects.stickLeaves = stickLeaves;
                        this.subjects.stickLeavesOne = stickLeavesOne;

                        this.scene.add(gltf.scene);

                        resolve();

                    }, null, () => reject())
                })
            );

            // spiral plant
            modelList.indexOf('plant') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.helpers.gltfLoader.load(spiralPlantModel, (gltf) => {

                        const leaves = [];

                        gltf.scene.children
                            .filter(mesh => mesh.name.includes('spiral_plant_leaf'))
                            .forEach(mesh => {
                                mesh.material = new THREE.MeshLambertMaterial({
                                    color: this.colors.plant,
                                    emissive: this.colors.plant,
                                    emissiveIntensity: 0
                                })
                                leaves.push(mesh);
                                this.staticObjects.push(mesh);
                            });

                        this.subjects.spiralPlantLeaves = leaves;

                        this.scene.add(gltf.scene);

                        resolve();

                    }, null, (err) => reject(err))
                })
            );

            // bookshelf
            modelList.indexOf('bookshelf') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    // 3d array: columns, rows, books in cell
                    this.subjects.books = new Array(4).fill(null).map(d => new Array(5).fill(null).map(d => []));

                    this.helpers.gltfLoader.load(bookcaseModel, (gltf) => {

                        const pageMat = new THREE.MeshLambertMaterial({ color: 0xE7DACA, side: THREE.DoubleSide });

                        gltf.scene.children.forEach((mesh) => {

                            // every mesh is static
                            this.staticObjects.push(mesh);

                            if (mesh.name.includes('book') && !mesh.name.includes('bookcase') && mesh.type === 'Group') {

                                const name = mesh.name;
                                const z = parseInt(name.slice(name.length - 1, name.length));
                                const y = parseInt(name.slice(name.length - 2, name.length - 1));
                                const x = parseInt(name.slice(name.length - 3, name.length - 2));
                                const r = -.1 + Math.random() * .2
                                const c = new THREE.Color(this.spectrumFunction(1 - ((r + y + .5) / 5)));

                                const bookMesh = mesh.children.find(mesh => mesh.material.name.includes('book'));
                                const pageMesh = mesh.children.find(mesh => mesh.material.name.includes('page'));

                                pageMesh.material = pageMat;
                                bookMesh.material = new THREE.MeshLambertMaterial({
                                    color: c,
                                    side: THREE.DoubleSide,
                                    emissive: c,
                                    emissiveIntensity: .1
                                });

                                this.subjects.books[x][y][z] = bookMesh;

                            }

                        });

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

        this.elapsedBeats = this.bpm * this.clock.getElapsedTime() / 60;
        this.fpcControl && this.controls.fpc.update(this.clock.getDelta());

        this.subjects.steam.rotateY(-.05);

        this.renderList.indexOf('table') !== -1 && renderMelody({
            leftPage: this.subjects.leftPage,
            rightPage: this.subjects.rightPage
        }, this.melodyAnalyser, {
            spectrumFunction: this.spectrumFunction,
            beats: this.elapsedBeats
        });

        this.renderList.indexOf('house') !== -1 && renderBass(this.subjects.godrays, this.bassAnalyser, {
            sunlight: this.lights.sunlight
        });

        this.renderList.indexOf('bookshelf') !== -1 && renderRhythm(this.subjects.books, this.rhythmAnalyser, {
            spectrumFunction: this.spectrumFunction,
            beats: this.elapsedBeats
        });

        this.renderList.indexOf('plant') !== -1 && renderHarmony({
            leaves: this.subjects.spiralPlantLeaves,
            stickLeaves: this.subjects.stickLeaves,
            stickLeavesOne: this.subjects.stickLeavesOne,
            group: this.subjects.spiralPlantGroup,
            box: this.subjects.spiralPlantBox
        }, this.harmonyAnalyser, {
            beats: this.elapsedBeats
        });

        this.renderer.render(this.scene, this.camera);
    }

}