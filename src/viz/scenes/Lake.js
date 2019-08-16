import SceneManager from '../SceneManager';
import * as THREE from 'three';
import * as d3Chromatic from 'd3-scale-chromatic';
import {regularPolygon, linToLog} from '../../utils/threeUtils';
import StarQuandrants from '../subjects/StarQuandrants';


export default class Lake extends SceneManager {
    constructor(canvas, vizConfig) {
        super(canvas, vizConfig);

        // https://www.colourlovers.com/palette/126030/Cruel_Water_at_Night
        // https://www.colourlovers.com/palette/60028/Night_Sky
        // https://www.colourlovers.com/palette/3325270/Barbibaus_Garden

        this.vizConfig = vizConfig;

        this.rhythmAnalyser = vizConfig.rhythm.analyser;
        this.atmosphereAnalyser = vizConfig.atmosphere.analyser;
        this.harmonyAnalyser = vizConfig.harmony.analyser;
        this.melodyAnalyser = vizConfig.melody.analyser;
        this.bassAnalyser = vizConfig.bass.analyser;

        this.palette = {

            // utility
            white: new THREE.Color(0xffffff),

            // highlights
            pink: 0xFE98AE,
            orange: 0xF6C0B6,
            yellow: 0xF2E5B9,
            hibiscus: 0x8C4B5C,
            lilyBlue: 0x00c5ff,
            lilyPink: 0xFF8DA1,
            rockGrey: 0x9d978e,
            lightning: 0xEEE6AB,

            // moon
            moonYellow: 0xf6f2d5,

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

        // lily vars
        this.prevMelodyVolume = 0;
        this.currentMelodyVolume = 0;
        this.lilyColors = [this.palette.dustyViolet, this.palette.pansyPurple, this.palette.funGreen, this.palette.hibiscus, this.palette.yellow]

        // TODO: parameterize
        super.init().then(() => {
            window.addEventListener('resize', () => {
                this.onWindowResize(window.innerWidth, window.innerHeight)
            });
            this.scene.fog = new THREE.Fog(0xffffff, 10, 470);
            this.scene.background = new THREE.Color('#1F262F').lerp(new THREE.Color(0x000000), 0.2);
            Promise.all([
                this.initLakeTrees(),
                this.initLakeScene(),
                this.initLakeRipples(),
                this.initLakeStars(),
                this.initLakeLilies(),
                this.initLakeMoon()
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
                const groundGeo = new THREE.PlaneBufferGeometry(550, 350);
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

                const moonGuard = new THREE.Mesh(new THREE.PlaneBufferGeometry(60, 30), groundMat);
                moonGuard.translateZ(-79);
                
                this.scene.add(moonGuard);

                // directional light
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
                directionalLight.position.set(0,10,0);
                this.scene.add(directionalLight);

                // point light fireflies
                const fireflyCount = 16;
                const fireFlyGroup = new THREE.Group();
                for(let i = 0; i < fireflyCount; i++) {
                    const g = new THREE.Group();
                    g.add(new THREE.PointLight(this.palette.moonYellow, 0.5));

                    const sphereGeo = new THREE.SphereBufferGeometry(0.25);
                    const sphereMat = new THREE.MeshBasicMaterial({
                        color: this.palette.lightning,
                        fog: false,
                        transparent: true
                    });
                    
                    g.add(new THREE.Mesh(sphereGeo, sphereMat));

                    g.position.set(
                        -70 + Math.random() * 140, 
                        5 + Math.random() * 15, 
                        40 - Math.random() * 70
                    );

                    g.userData.cycle = 0;
                    g.userData.state = 'off';
                    fireFlyGroup.add(g);
                }

                this.subjects.fireflies = fireFlyGroup;
                this.scene.add(fireFlyGroup);

                // add some rocks
                this.helpers.gltfLoader.load('/models/landscape.gltf', (model) => {
                    this.subjects.rocks = model.scene.children.find((e) => e.name = 'rockGroup');
                    this.subjects.rocks.children.map((rock) => {rock.material.color.setRGB(0.06, 0.06, 0.06)});
                    this.scene.add(this.subjects.rocks);

                    this.subjects.bushes = model.scene.children.find((e) => e.name = 'bushGroup');
                    this.subjects.bushes.children.map((bush) => {bush.material.color.lerp(new THREE.Color(0x000000), 0.75)});
                    this.scene.add(this.subjects.bushes);
                }, undefined, (err) => {
                    if(err) {reject(err)}
                })

                resolve();

            } catch(err) {
                reject(err)
            }
        });
    }

    initLakeMoon() {
        return new Promise((resolve, reject) => {
            try {

                const moonRadius = 25;
                const numVertices = this.bassAnalyser.fftSize;

                const moonGeo = new THREE.CircleBufferGeometry(moonRadius,numVertices,numVertices);
                const moonMat = new THREE.MeshBasicMaterial({
                    color: this.palette.moonYellow,
                    fog: false
                });

                const moonMesh = new THREE.Mesh(moonGeo, moonMat);
                moonMesh.userData.radius = moonRadius;
                moonMesh.position.set(0, 35, -80);

                this.subjects.moon = moonMesh;
                this.scene.add(moonMesh);

                // moon beams
                const moonBeams = new THREE.Group();

                // once per moon beam
                for(let j = 0; j < 5; j++) {

                    const moonBeamGeo = new THREE.BufferGeometry();
                    const positions = new Float32Array(numVertices * 3);

                    for(let i = 0; i < numVertices; i++){
                        positions[i*3] = Math.cos(2 * Math.PI * (i/numVertices));
                        positions[i*3+1] = Math.sin(2 * Math.PI * (i/numVertices));
                        positions[i*3+2] = 0;
                    }
    
                    moonBeamGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
                    moonBeamGeo.translate(0,35,-81);
    
                    const moonBeamMat = new THREE.PointsMaterial({
                        color: this.palette.moonYellow,
                        transparent: true,
                        opacity: 0
                    });
                    
                    const moonBeam = new THREE.Points(moonBeamGeo, moonBeamMat);
                    moonBeams.add(moonBeam);

                }

                this.subjects.moonBeams = moonBeams;
                this.scene.add(moonBeams);

                resolve();
            } catch (err) {
                reject(err)
            }
        })
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
                    clone.children[0].material = new THREE.MeshBasicMaterial({
                        color: this.palette.tropicalGreen.clone().lerp(new THREE.Color(this.palette.white), -1.5)
                    })
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
                    baseGeoGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
                        color: this.palette.mythicPurple, 
                        transparent: true, 
                        opacity: 0})));
                    
                }

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
                this.subjects.stars = new StarQuandrants(this.scene, 8, this.scene.background, {
                    count: 100,
                    width: 350,
                    height: 150,
                    depth: 250,
                    center: new THREE.Vector3(0, -13, -335),
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

                const numLilies = 16;
                const lilyGroup = new THREE.Group();

                for(let i = 1; i <= numLilies; i++) {
                    
                    const clone = baseLily.clone();
                    const upperPetalMatClone = upperPetalMat.clone();
                    const lowerPetalMatClone = lowerPetalMat.clone();

                    if(i%2 === 0) {
                        upperPetalMatClone.color.set(this.palette.lilyBlue);
                        clone.userData.color = this.palette.lilyBlue;
                    } else {
                        upperPetalMatClone.color.set(this.palette.lilyPink);
                        clone.userData.color = this.palette.lilyPink;
                    }

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
        
        /* 
         * RIPPLES
         */

        // only render when sources are on
        if(this.vizConfig.rhythm.players.filter((player) => {return (player.player.state) === 'started';}).length > 0) {
            this.rhythmAnalyser.getFrequencyData().map((d, i) => {
                const damping = 100 * (i / this.rhythmAnalyser.frequencyBinCount);
                this.subjects.ripples.children[i].material.opacity = ((d - damping) / 255);
                this.subjects.ripples.children[i].material.needsUpdate = true;
            });
        }

        /* 
         * STARS
         */

        // only render when sources are on
        if(this.vizConfig.atmosphere.players.filter((player) => {return (player.player.state) === 'started';}).length > 0) {

            const atmosphereFreqDataLeft = this.atmosphereAnalyser.getFrequencyData('left');
            const atmosphereFreqDataRight = this.atmosphereAnalyser.getFrequencyData('right');

            atmosphereFreqDataLeft.slice(0,8).map((d, i) => {
                this.subjects.stars.leftGroup.children[i].material.opacity = (d / 170);
                this.subjects.stars.leftGroup.children[i].material.needsUpdate = true;
            })

            atmosphereFreqDataRight.slice(0,8).map((d, i) => {
                this.subjects.stars.rightGroup.children[i].material.opacity = (d / 170);
                this.subjects.stars.rightGroup.children[i].material.needsUpdate = true;
            })
        }

        /* 
         * TREES
         */

        // only render when sources are on
        if(this.vizConfig.harmony.players.filter((player) => {return (player.player.state) === 'started';}).length > 0) {
            const harmonyFreqData = this.harmonyAnalyser.getFrequencyData();
            this.subjects.pineTrees.children.map((child, i) => {
                const freqIndex = Math.floor(i/8);
                const rawData = harmonyFreqData.slice([1+freqIndex])[0];
                const tranformedData = Math.pow(rawData,6) / (Math.pow(255,6) * 0.060);

                const color = this.palette.tropicalGreen.clone();
                color.lerp(this.palette.white, -1.5 + (tranformedData));

                child.children[0].material.color.set(color);
                child.children[0].material.needsUpdate = true;
            });
        }

        /* 
         * MOON
         */

        // only render when sources are on
        if(this.vizConfig.bass.players.filter((player) => {return (player.player.state) === 'started';}).length > 0) {
            const bassVol = this.bassAnalyser.getFrequencyData().reduce((a, b) => {return a+b;})/this.bassAnalyser.frequencyBinCount;
            const bassFrequencies = this.bassAnalyser.getFrequencyData().slice(0,this.subjects.moonBeams.length);
            const radius = this.subjects.moon.userData.radius;

            this.subjects.moonBeams.children.map((moonBeam, beamIndex) => {

                moonBeam.material.opacity = 0.1 + (beamIndex/7);

                for (let count = 0; count < moonBeam.geometry.attributes.position.count; count ++) {
                    const adj = (1/(0.25 * (beamIndex+1)));
                    const rot = bassFrequencies[beamIndex] / 255;
                    moonBeam.geometry.attributes.position.array[count*3] = (radius - 7 + (bassVol/3) * adj) * Math.cos(2 * Math.PI * (count/this.bassAnalyser.fftSize + rot/2));
                    moonBeam.geometry.attributes.position.array[count*3+1] = (radius - 7 + (bassVol/3) * adj) * Math.sin(2 * Math.PI * (count/this.bassAnalyser.fftSize + rot/6)) + this.subjects.moon.position.y;
                };
                
                moonBeam.geometry.attributes.position.needsUpdate = true;
            });
        } else {
            this.subjects.moonBeams.children.map((moonBeam) => {moonBeam.material.opacity = 0;})
        }

        /* 
         * LILIES
         */

        // only render when sources are on
        if(this.vizConfig.melody.players.filter((player) => {return (player.player.state) === 'started';}).length > 0) {
            const melodyFreqData = this.melodyAnalyser.getFrequencyData();//.slice(5);
            
            let melodyVolume = 0;
            let melodyCount = 0;
                    
            for(let i = 0; i < melodyFreqData.length; i++) {
                melodyVolume += melodyFreqData[i];
                melodyCount ++;
            }
            
            const avgMelodyVolume = melodyVolume/melodyCount;
            
            this.subjects.lilies.children.map((lily, i) => {

                const upperPetalGroup = lily.children.find((child) => {return child.name === 'upperPetalGroup'});
                const lowerPetalGroup = lily.children.find((child) => {return child.name === 'lowerPetalGroup'});

                if(avgMelodyVolume != 0 && avgMelodyVolume >= 1.25 * (this.prevMelodyVolume) && Math.random() >= 0.7) {
                    upperPetalGroup.children[0].children[0].material.color.set(this.palette.white);
                    lowerPetalGroup.children[0].children[0].material.color.set(this.palette.white);
                } else {
                    upperPetalGroup.children[0].children[0].material.color.lerp(new THREE.Color(lily.userData.color), 0.055);
                    lowerPetalGroup.children[0].children[0].material.color.lerp(new THREE.Color(lily.userData.color), 0.055);
                }
            })

            this.prevMelodyVolume = avgMelodyVolume;
        }

        /* 
         * FIREFLIES
         */

        const flyAmount = .3;
        const flightNoise = 0.01;
        this.subjects.fireflies.children.map((fly) => {
            if(fly.userData.state === 'off' && Math.random() < 0.0005) {
                fly.userData.state = 'lighting';
                fly.userData.flightPath = new THREE.Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random());
            }

            if(fly.userData.state === 'lighting') {
                fly.userData.cycle += 0.1;
                if(fly.userData.cycle >= 1) {
                    fly.userData.state = 'dimming';
                }
            }
            
            if(fly.userData.state === 'dimming') {
                fly.userData.cycle -= 0.025;
                if(fly.userData.cycle <= 0) {
                    fly.userData.state = 'off';
                }
            }

            if(fly.userData.state === 'dimming' || fly.userData.state === 'lighting') {
                const newX = Math.min(Math.max(fly.position.x + (fly.userData.flightPath.x + (flightNoise / -2 + flightNoise)) * flyAmount, -70), 140);
                const newY = Math.min(Math.max(fly.position.y + (fly.userData.flightPath.x + (flightNoise / -2 + flightNoise)) * flyAmount, 5), 20);
                const newZ = Math.min(Math.max(fly.position.z + (fly.userData.flightPath.x + (flightNoise / -2 + flightNoise)) * flyAmount, -20), 70);
                fly.position.set(newX, newY, newZ);
            }
            
            fly.children[0].intensity = fly.userData.cycle / 2;
            fly.children[1].material.opacity = fly.userData.cycle;

        })

        this.renderer.render(this.scene, this.camera);
    }

}