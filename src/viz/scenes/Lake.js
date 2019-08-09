import SceneManager from '../SceneManager';
import * as THREE from 'three';
import * as d3Chromatic from 'd3-scale-chromatic';
import {regularPolygon, linToLog} from '../../utils/threeUtils';
import StarQuandrants from '../subjects/StarQuandrants';

export default class Lake extends SceneManager {
    constructor(canvas, analyserArray) {
        super(canvas, analyserArray);

        // https://www.colourlovers.com/palette/126030/Cruel_Water_at_Night
        // https://www.colourlovers.com/palette/60028/Night_Sky
        // https://www.colourlovers.com/palette/3325270/Barbibaus_Garden

        this.rhythmAnalyser = this.analyserArray.find((e) => {return e.id === 'rhythm'}).analyser;
        this.atmosphereAnalyser = this.analyserArray.find((e) => {return e.id === 'atmosphere'}).analyser;
        this.harmonyAnalyser = this.analyserArray.find((e) => {return e.id === 'harmony'}).analyser;
        this.melodyAnalyser = this.analyserArray.find((e) => {return e.id === 'melody'}).analyser;
        this.bassAnalyser = this.analyserArray.find((e) => {return e.id === 'bass'}).analyser;

        console.log(analyserArray);

        this.palette = {

            // utility
            white: new THREE.Color(0xffffff),

            // highlights
            pink: 0xFE98AE,
            orange: 0xF6C0B6,
            yellow: 0xF2E5B9,
            hibiscus: 0x8C4B5C,

            // greens
            funGreen: new THREE.Color(0x95DBB1),
            tropicalGreen: new THREE.Color(0x70A491),
            neonGreen: 0xDEFFB0,
            deepForest: 0x022A1E,

            // purples
            darkBlueViolet: 0x301860,
            mythicPurple: 0x66587C,
            pansyPurple: 0x483078,
            dustyViolet: new THREE.Color(0x604878),
            brighterPurple: 0x906090,

            // blues
            inkyBlue: 0x20293F,
            camiBlueDark: 0x272345,

            // dark
            deepInk: 0x030C22
        };

        // TODO: parameterize
        super.init().then(() => {
            window.addEventListener('resize', () => {
                this.onWindowResize(window.innerWidth, window.innerHeight)
            });
            this.scene.fog = new THREE.Fog(0xffffff, 10, 600);
            Promise.all([
                this.initLakeTrees(),
                this.initLakeScene(),
                this.initLakeRipples(),
                this.initLakeStars(),
                this.initLakeLilies()
            ]).then(() => {
                console.log(this);
                super.animate();

            })
        })
    }

    initLakeScene() {
        return new Promise((resolve, reject) => {
            try {
                // hexagon shape for the lake body
                const lakeShapePoints = regularPolygon(6, 110, 0, 0, true, false, true);
                const lakeShapeVectors = []
                for(let i = 0; i < lakeShapePoints.length; i+=2) {
                    lakeShapeVectors.push(new THREE.Vector2(lakeShapePoints[i], lakeShapePoints[i+1]));
                }
                const lakeShape = new THREE.Shape(lakeShapeVectors);
                const lakeGeo = new THREE.ShapeBufferGeometry(lakeShape);
                lakeGeo.rotateX(-Math.PI / 2);
                lakeGeo.translate(0,0,70);
                const lakeMat = new THREE.MeshBasicMaterial({
                    color: this.palette.deepInk,
                    fog: false
                });
                const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
                this.subjects.lake = lakeMesh;
                this.scene.add(lakeMesh);
    
                // basic rectangle for the ground
                const groundGeo = new THREE.PlaneBufferGeometry(550, 150);
                groundGeo.rotateX(-Math.PI / 2);
                groundGeo.translate(0,-1,0);
                const groundMat = new THREE.MeshBasicMaterial({
                    color: 0x022A1E,
                    fog: false
                });
                groundMat.color.lerp(new THREE.Color(0x000000), 0.75); // TODO: figure out the color issue
                const groundMesh = new THREE.Mesh(groundGeo, groundMat)
                this.subjects.ground = groundMesh;
                this.scene.add(groundMesh);
                resolve();

            } catch(err) {
                reject(err)
            }
        });
    }

    initLakeTrees() {
        return new Promise((resolve, reject) => {
            // load gltf tree models
            this.helpers.gltfLoader.load('/models/pine-tree.gltf', (model) => {
                const basePineTree = model.scenes[0].children[0];
                
                // generate simple tree formation
                const pineTreeGroup = new THREE.Group();
                const numPineTrees = 64;
                const xMin = -100;
                const xMax = 100;
                const xNoise = 5;
                const zNoise = 10;
                const scaleNoise = 0.3;
                
                for(let i = 1; i <= numPineTrees; i++) {
                    const x = xMin + i/numPineTrees * (xMax - xMin) + (Math.random() * xNoise - xNoise/2);
                    
                    // z(x) is piecewise and is calculated using the coordinates of the lake hexagon
                    let z;
                    if(x < -55) {
                        z = -1 * ((95/55) * x + 190) - (Math.random() * zNoise);
                    } else if(x >= -55 && x < 55) {
                        z = -95 - (Math.random() * zNoise);
                    } else if(x >= 55) {
                        z = -1 * (-(95/55) * x + 190) - (Math.random() * zNoise);
                    }
                    
                    const clone = basePineTree.clone();
                    const scale = 1 - (scaleNoise * Math.random());
                    clone.children[0].material = new THREE.MeshBasicMaterial()
                    clone.position.copy(new THREE.Vector3(x, -2, z + 70));
                    clone.scale.copy(new THREE.Vector3(scale, scale, scale));
                    clone.rotateY(Math.random() * 2 * Math.PI);
                    pineTreeGroup.add(clone);
                }
                this.subjects.pineTrees = pineTreeGroup;
                this.scene.add(pineTreeGroup);
                resolve();
            }, undefined, (err) => {
                reject(err);
            });
        });
    }

    initLakeRipples() {
        return new Promise((resolve, reject) => {
            try{
                const n = this.rhythmAnalyser.frequencyBinCount;
                const numSides = 6;
                const baseWidth = 1;
                const polygonPoints = regularPolygon(numSides, baseWidth, 0, 0, true, true);
                const bandScale = 100; // how far out the bands will extend
                const bandScaleLogConstants = linToLog(bandScale);

                const baseGeoGroup = new THREE.Group();
                const baseGeo = new THREE.BufferGeometry();
                baseGeo.addAttribute('position', new THREE.BufferAttribute(polygonPoints, 3));

                for (let i = 0; i < n; i++) {

                    // clone and scale
                    const geo = baseGeo.clone();
                    const linScale = 1 + (i / n) * bandScale;
                    const logScale = Math.log(linScale/bandScaleLogConstants.a)/bandScaleLogConstants.b;
                    geo.scale(logScale, logScale, logScale);
                    geo.translate(0, 1, 70);

                    // add to group
                    baseGeoGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({color: this.palette.mythicPurple, transparent: true})));
                    
                }

                // hide first line for aesthetic purposes
                // baseGeoGroup.children[0].visible = false;

                // bind subject and add to scene
                this.subjects.ripples = baseGeoGroup;
                this.scene.add(baseGeoGroup);

                resolve();
            } catch(err) {
                reject(err);
            }
        });
    }

    initLakeStars() {
        return new Promise((resolve, reject) => {
            try{
                this.subjects.stars = new StarQuandrants(this.scene, 8, {
                    count: 100,
                    width: 500,
                    height: 150,
                    depth: 250,
                    center: new THREE.Vector3(0, 0, -300),
                    colorPalette: d3Chromatic.interpolateCool
                });
                resolve();
            } catch(err) {
                reject(err)
            }
        });
    }

    initLakeLilies() {
        return new Promise((resolve, reject) => {
            // load gltf lily models
            this.helpers.gltfLoader.load('/models/lily.gltf', (gltf) => {

                const model = gltf.scene.children[1];
                
                const lowerPetal = model.children[0].clone();
                const lowerPetalMat = lowerPetal.material.clone();

                const upperPetal = model.children[1].clone();
                const upperPetalMat = upperPetal.material.clone();

                const sphere = model.children[2].clone();
                const sphereMat = sphere.material.clone();

                const lilyPad = model.children[3].clone();
                const lilyPadMat = lilyPad.material.clone();

                // initialize base lily
                const baseLily = new THREE.Group();
                const upperPetalGroup = new THREE.Group();
                upperPetalGroup.name = 'upperPetalGroup';
                const lowerPetalGroup = new THREE.Group();
                lowerPetalGroup.name = 'lowerPetalGroup';

                baseLily.add(upperPetalGroup, lowerPetalGroup, sphere, lilyPad);

                // duplicate and rotate petals, adding each to their corresponding group
                for (let i = 0; i < 8; i++) {
                    const upperClone = new THREE.Group().add(upperPetal.clone());
                    upperClone.rotateY(Math.PI * 2 * (i/8));

                    const lowerClone = new THREE.Group().add(lowerPetal.clone());
                    lowerClone.rotateY(Math.PI * 2 * (i/8));

                    upperPetalGroup.add(upperClone);
                    lowerPetalGroup.add(lowerClone);
                }


                // baseLily.children.find((child) => {return child.name === 'upperPetalGroup'}).children[0].children[0].material.color.set(0xff0000);
                // baseLily.children.find((child) => {return child.name === 'upperPetalGroup'}).children[0].children[0].material.needsUpdate = true;

                const numLilies = 16;
                const lilyGroup = new THREE.Group();

                for(let i = 1; i <= numLilies; i++) {
                    
                    const clone = baseLily.clone();
                    const upperPetalMatClone = upperPetalMat.clone();
                    const lowerPetalMatClone = lowerPetalMat.clone();

                    clone.children.find((child) => {return child.name === 'upperPetalGroup'}).children.map((petalGroup) => {
                        petalGroup.children[0].material = upperPetalMatClone;
                    })

                    clone.children.find((child) => {return child.name === 'lowerPetalGroup'}).children.map((petalGroup) => {
                        petalGroup.children[0].material = lowerPetalMatClone;
                    })

                    const scale = 2;
                    const x = -50 + Math.random()*100;
                    const z = 90 - Math.random()*75;

                    clone.scale.copy(new THREE.Vector3(scale, scale, scale));
                    clone.position.copy(new THREE.Vector3(x, 1, z));

                    lilyGroup.add(clone);

                }

                this.subjects.lilies = lilyGroup;
                this.scene.add(lilyGroup);

                resolve();
            }, undefined, (err) => {
                reject(err);
            });
        });
    }
    
    render() {
        
        this.controls.fpc.update(this.clock.getDelta());
        
        // ripples
        this.rhythmAnalyser.getFrequencyData().map((d, i) => {
            const damping = 150 * (i / this.rhythmAnalyser.frequencyBinCount);
            this.subjects.ripples.children[i].material.opacity = 0.85 * ((d - damping) / 255);
            this.subjects.ripples.children[i].material.needsUpdate = true;
        });

        // stars
        const atmosphereFreqDataLeft = this.atmosphereAnalyser.getFrequencyData('left');
        const atmosphereFreqDataRight = this.atmosphereAnalyser.getFrequencyData('right');

        atmosphereFreqDataLeft.slice(2,10).map((d, i) => {
            this.subjects.stars.leftGroup.children[i].material.opacity = (d / 200);
            this.subjects.stars.leftGroup.children[i].material.needsUpdate = true;
        })

        atmosphereFreqDataRight.slice(2,10).map((d, i) => {
            this.subjects.stars.rightGroup.children[i].material.opacity = (d / 200);
            this.subjects.stars.rightGroup.children[i].material.needsUpdate = true;
        })

        // trees
        const harmonyFreqData = this.harmonyAnalyser.getFrequencyData();
        this.subjects.pineTrees.children.map((child, i) => {

            const freqIndex = Math.floor(i/8);
            const rawData = harmonyFreqData.slice([2+freqIndex])[0];
            const tranformedData = Math.pow(rawData,6) / (Math.pow(255,6) * 0.07);

            const color = this.palette.tropicalGreen.clone();
            color.lerp(this.palette.white, -1.5 + (tranformedData));// * ((freqIndex + 1 )/ 3));

            child.children[0].material.color.set(color);
            child.children[0].material.needsUpdate = true;

        })

        // lilies
        this.subjects.lilies.children.map((lily, i) => {
            const upperPetalGroup = lily.children.find((child) => {return child.name === 'upperPetalGroup'});
            upperPetalGroup.children[0].children[0].material.color.setRGB(Math.random(), Math.random(), Math.random());
        })


        this.renderer.render(this.scene, this.camera);
    }

}