import SceneManager from '../SceneManager';
import * as THREE from 'three';

export default class Lake extends SceneManager {
    constructor(canvas, analyserArray) {
        super(canvas, analyserArray);

        // https://www.colourlovers.com/palette/126030/Cruel_Water_at_Night
        // https://www.colourlovers.com/palette/60028/Night_Sky
        // https://www.colourlovers.com/palette/3325270/Barbibaus_Garden

        this.uniforms = {
            kickSnare1: undefined
        }

        this.palette = {

            // highlights
            pink: 0xFE98AE,
            orange: 0xF6C0B6,
            yellow: 0xF2E5B9,
            hibiscus: 0x8C4B5C,

            // greens
            funGreen: 0x95DBB1,
            tropicalGreen: 0x70A491,
            neonGreen: 0xDEFFB0,

            // purples
            darkBlueViolet: 0x301860,
            mythicPurple: 0x66587C,
            pansyPurple: 0x483078,
            dustyViolet: 0x604878,
            brighterPurple: 0x906090,

            // blues
            inkyBlue: 0x20293F,
            camiBlueDark: 0x272345,

            // dark
            deepInk: 0x030C22
        };

        this.rippleVertexShader = `
            precision highp float;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            attribute float offset;
            attribute float volume;
            attribute vec3 position;
            
            varying vec3 vPosition;
            varying float vVolume;

            void main(){
                vVolume = volume;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position * offset, 1.0 );
            }
        `;

        this.rippleFragmentShader = `
            precision highp float;

            varying vec3 vPosition;
            varying vec4 vColor;
            varying float vVolume;
            
            void main() {
                float sVolume = 2.5 * vVolume;
                gl_FragColor = vec4(sVolume / 255.0, sVolume / 255.0, sVolume / 255.0, 1.0);
            }
        `;

        // TODO: parameterize
        super.init().then(() => {
            window.addEventListener('resize', this.onWindowResize(window.innerWidth, window.innerHeight));
            //this.initLakeScene();
            this.initLakeRipples();
            console.log(this);
            super.animate();
        })
    }

    initLakeScene() {

        //this.scene.background = new THREE.Color(this.palette.deepInk);

        // basic scaled circle for the lake itself
        const xScale = 100;
        const yScale = 60;
        const lakeGeo = new THREE.CircleBufferGeometry(1,64);
        lakeGeo.scale(xScale,yScale,1);
        lakeGeo.rotateX(Math.PI/2);
        lakeGeo.translate(0,0,yScale/2);
        const lakeMat = new THREE.MeshBasicMaterial({color: this.palette.deepInk, side: THREE.DoubleSide});
        const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);

        this.subjects.lake = lakeMesh;
        this.scene.add(lakeMesh);

    }

    initLakeRipples() {

        // base geometry
        const ringGeo = new THREE.RingBufferGeometry(0.99,1,8,8);
        ringGeo.rotateX(-Math.PI/2);
        // ringGeo.translate(0,0,1);
        console.log(ringGeo);

        const iGeo = new THREE.InstancedBufferGeometry();
        iGeo.index = ringGeo.index;
        iGeo.attributes = ringGeo.attributes;

        const numBands = this.analyserArray[0].analyser.numBands - 1;
        const offsets = new Float32Array(numBands);
        const volumes = new Float32Array(numBands);

        for(let i = 0; i < numBands; i++) {
            offsets[i] = 100*(i/numBands);
        }

        iGeo.addAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 1));
        iGeo.addAttribute('volume', new THREE.InstancedBufferAttribute(volumes, 1));

        const iMat = new THREE.RawShaderMaterial({
            // uniforms: {
            //     volume: this.uniforms.kickSnare1
            // },
            vertexShader: this.rippleVertexShader,
            fragmentShader: this.rippleFragmentShader,
            depthTest: true,
            depthWrite: true
        });

        const rippleMesh = new THREE.Mesh(iGeo, iMat);
        this.subjects.ripples = rippleMesh;
        this.scene.add(rippleMesh);

    }

    addKickSnare() {

    }

    render() {
        // console.log(this.analyser.getFrequencyData());
        let d = this.clock.getDelta();
        let e = this.clock.getElapsedTime();
        //this.subjects.lake.rotation.x += 0.01;

        //console.log(this.subjects.ripples);

        // console.log(this.analyserArray[0].analyser.getFrequencyData());
        // console.log(this.analyserArray[0].analyser.getFrequencyData().length)

        //this.subjects.ripples.geometry.attributes.volume.array = Float32Array.from(this.analyserArray[0].analyser.getFrequencyData());
        this.subjects.ripples.geometry.attributes.volume.copyArray(this.analyserArray[0].analyser.getFrequencyData());
        this.subjects.ripples.geometry.attributes.volume.needsUpdate = true;

        this.renderer.render(this.scene, this.camera);
    }

}