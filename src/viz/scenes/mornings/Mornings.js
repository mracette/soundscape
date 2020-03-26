// libs
import * as THREE from 'three';
import { SceneManager } from '../../SceneManager';
import FirstPersonControls from '../../controls/FirstPersonControls';

// rendering
import { renderBass } from './renderBass';
import { renderRhythm } from './renderRhythm';
import { renderHarmony } from './renderHarmony';
import { renderMelody } from './renderMelody';
import { renderAtmosphere } from './renderAtmosphere';

// shaders
import { rgbaVertex, rgbaFragment } from '../../shaders/rgba';

export class Mornings extends SceneManager {

    constructor(canvas, analysers, callback, extras) {

        super(canvas);

        this.canvas.style = `
            background-color: none; background: 
            linear-gradient(
                to top, 
                #F0A9B3 45%, 
                #D8B7B6 55%,
                #BEBDC3 70%,
                #A1BCD4 85%,
                #80BDE8 100%
            );
        `;

        this.DPRMax = 2.25;
        this.spectrumFunction = extras.spectrumFunction;
        this.songId = 'mornings';

        this.colors = {
            morningLight: new THREE.Color(0xF0A9B3),
            plant: new THREE.Color(0x7B9E53),
            white: new THREE.Color(0xFFFFFF),
            paleBlue: new THREE.Color(0xDEEEFF),
            coffee: new THREE.Color(0x260e00),
            deepBlue: new THREE.Color(0x213058),
            blueGrey: new THREE.Color(0xB0B1B6)
        };
        this.renderList = [
            'house', 'plant', 'table', 'bookcase', 'flower'
        ];
        this.bpm = extras.bpm;

        this.rhythmAnalyser = analysers.find(a => a.id === 'rhythm-analyser');
        this.atmosphereAnalyser = analysers.find(a => a.id === 'extras-analyser');
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
            // render once to get objects in place
            this.render(this.renderList);
            this.applyAll(this.scene, (child) => {
                // freeze objects that don't move
                child.matrixAutoUpdates = false;
                // lambert material is the most efficient
                if (child.material && child.material.type === 'MeshStandardMaterial') {
                    const mat = new THREE.MeshLambertMaterial({
                        color: child.material.color,
                        side: THREE.DoubleSide,
                        emissive: child.material.emissive,
                        emissiveIntensity: child.material.emissiveIntensity
                    });
                    child.material.dispose();
                    child.material = mat;
                }
            }, ['steam', 'van_gogh', 'vonnegut', 'carpet', 'god_rays_top', 'god_rays_bottom']);
            super.animate();
        }).catch((err) => {
            console.log(err);
        });

    }

    applySceneSettings() {

        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
        this.renderer.setClearColor(0x000000, 0.0);

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
        return scene;

    }

    initLights() {

        const lights = {
            ambient: new THREE.AmbientLight(this.colors.morningLight.clone().lerp(this.colors.white, .65), .35),
            sunlight: new THREE.DirectionalLight(this.colors.white, 0),
            pointOne: new THREE.PointLight(0xffffff, .1)
        }


        lights.pointOne.position.set(-36.792147432025736, 12.295984744079584, 19.50565058881036);

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

                    this.subjects.stringLights = [];
                    this.subjects.godRays = []

                    this.loadModel({ name: 'house' }).then((model) => {

                        model.scene.children.forEach((mesh) => {

                            if (mesh.type === 'Group' && mesh.name.includes('string_light')) {
                                mesh.children[1].material.emissive = mesh.children[1].material.color;
                                this.subjects.stringLights.push(mesh.children[1]);
                            }

                            if (mesh.name === 'bushes') {
                                mesh.material.emissive = mesh.material.color;
                                mesh.material.emissiveIntensity = .5;
                            }

                            if (mesh.name === 'god_rays_top' || mesh.name === 'god_rays_bottom') {
                                mesh.material = new THREE.MeshBasicMaterial({
                                    color: this.colors.white,
                                    transparent: true,
                                    side: THREE.DoubleSide,
                                    opacity: .025
                                });
                                this.subjects.godRays.push(mesh);
                            }

                        });

                        this.scene.add(model.scene);
                        resolve();

                    });
                })
            );

            // paintings
            modelList.indexOf('house') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.loadModel({ name: 'paintings' }).then((model) => {

                        model.scene.children.forEach((mesh) => {

                            if (mesh.name === 'vonnegut_self_portrait') {
                                mesh.material.side = THREE.FrontSide;
                                mesh.material.map.minFilter = THREE.LinearFilter;
                            };
                            if (mesh.name === 'van_gogh') {
                                mesh.material.side = THREE.BackSide;
                                mesh.material.map.minFilter = THREE.LinearFilter;
                            };

                        });

                        this.scene.add(model.scene);
                        resolve();

                    });

                })
            );

            // table
            modelList.indexOf('table') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.loadModel({ name: 'table' }).then((model) => {

                        const pageGeo = new THREE.PlaneBufferGeometry(1.9, 1.8, 64, 64);
                        pageGeo.rotateX(-Math.PI / 2);

                        model.scene.children.forEach((mesh) => {

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
                            }

                        });

                        model.scene.children.filter(c => c.name.includes('page')).forEach(mesh => model.scene.remove(mesh));
                        this.scene.add(model.scene);

                        resolve();

                    });
                })
            );

            // flowers
            modelList.indexOf('flower') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    const stickLeaves = [];
                    const stickLeavesOne = [];
                    this.subjects.innerPetals = [];
                    this.subjects.outerPetals = [];


                    this.loadModel({ name: 'flowers' }).then((model) => {

                        model.scene.children.forEach((mesh) => {

                            if (mesh.name.includes('Inner_Petals')) {
                                mesh.material.emissive = mesh.material.color;
                                mesh.material.emissiveIntensity = 0;
                                this.subjects.innerPetals.push(mesh);
                            }

                            if (mesh.name.includes('Outer_Petals')) {
                                mesh.material.emissive = mesh.material.color;
                                mesh.material.emissiveIntensity = 0;
                                this.subjects.outerPetals.push(mesh);
                            }

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

                        this.scene.add(model.scene);

                        resolve();

                    });
                })
            );

            // spiral plant
            modelList.indexOf('plant') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    this.loadModel({ name: 'spiral_plant' }).then((model) => {

                        const leaves = [];

                        model.scene.children
                            .filter(mesh => mesh.name.includes('spiral_plant_leaf'))
                            .forEach(mesh => {
                                mesh.material = new THREE.MeshLambertMaterial({
                                    color: this.colors.plant,
                                    emissive: this.colors.plant,
                                    emissiveIntensity: 0
                                })
                                leaves.push(mesh);
                            });

                        this.subjects.spiralPlantLeaves = leaves;

                        this.scene.add(model.scene);

                        resolve();

                    });
                })
            );

            // bookshelf
            modelList.indexOf('bookcase') !== -1 && loadPromiseArray.push(
                new Promise((resolve, reject) => {

                    // 3d array: columns, rows, books in cell
                    this.subjects.books = new Array(4).fill(null).map(d => new Array(5).fill(null).map(d => []));

                    this.loadModel({ name: 'bookcase' }).then((model) => {

                        const pageMat = new THREE.MeshLambertMaterial({ color: 0xE7DACA, side: THREE.DoubleSide });

                        model.scene.children.forEach((mesh) => {

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

                        this.scene.add(model.scene);

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

            this.subjects.steam.rotateY(-.05);

            (this.playerState && (this.playerState.melody || overridePause)) && renderMelody({
                innerPetals: this.subjects.innerPetals,
                outerPetals: this.subjects.outerPetals,
                leftPage: this.subjects.leftPage,
                rightPage: this.subjects.rightPage
            }, this.melodyAnalyser, {
                spectrumFunction: this.spectrumFunction,
                beats: this.elapsedBeats
            });

            (this.playerState && (this.playerState.bass || overridePause)) && renderBass(this.subjects.godRays, this.bassAnalyser, {
                sunlight: this.lights.sunlight
            });

            (this.playerState && (this.playerState.rhythm || overridePause)) && renderRhythm(this.subjects.books, this.rhythmAnalyser, {
                spectrumFunction: this.spectrumFunction,
                beats: this.elapsedBeats
            });

            (this.playerState && (this.playerState.harmony || overridePause)) && renderHarmony({
                leaves: this.subjects.spiralPlantLeaves,
                stickLeaves: this.subjects.stickLeaves,
                stickLeavesOne: this.subjects.stickLeavesOne,
                group: this.subjects.spiralPlantGroup,
                box: this.subjects.spiralPlantBox
            }, this.harmonyAnalyser, {
                beats: this.elapsedBeats
            });

            (this.playerState && (this.playerState.extras || overridePause)) && renderAtmosphere(
                this.subjects.stringLights,
                this.atmosphereAnalyser,
                {
                    beats: this.elapsedBeats,
                    enabled: this.playerState.extras
                }
            );

            this.renderer.render(this.scene, this.camera);

        }
    }

}