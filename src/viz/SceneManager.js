import * as THREE from 'three';
import FirstPersonControls from './controls/FirstPersonControls';

export default class SceneManager {
    constructor(canvas, analyserArray){

        const $this = this;
        this.that = this;

        this.analyserArray = analyserArray;

        this.canvas = canvas;
        this.clock = new THREE.Clock(true);

        this.screenDimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        this.worldDimensions = {
            width: 1000,
            height: 1000,
            depth: 1000
        };

        this.animate = this.animate.bind(this);
        this.render = this.render.bind(this);

    }

    init(scene) {
        return new Promise((resolve, reject) => {
            try {
                // lights, camera, action
                this.scene = this.initScene();
                this.renderer = this.initRender();
                this.camera = this.initCamera('perspective');
                this.lights = this.initLights();
                this.controls = this.initControls();
                this.helpers = this.initHelpers();
                this.subjects = this.initSubjects(scene);
                resolve();
            } catch(e) {
                console.error(e);
                reject(e)
            }
        })
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.helpers.fpc.update(this.clock.getDelta());
        this.render();
    }

    render() {
        // overridden by child class
    }

    initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#1F262F');
        return scene;
    }

    initRender() {

        const renderer = new THREE.WebGLRenderer( { 
            canvas: this.canvas,
            antialias: true
        } );
        const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;

        renderer.setSize(this.canvas.width, this.canvas.height);
        renderer.setClearColor( 0xffffff, 1 );
        renderer.setPixelRatio( DPR );

        return renderer;
    }

    initCamera(type, frustrum) {

        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 1000; 
        const aspect = this.screenDimensions.width / this.screenDimensions.height;
        let camera;
        
        switch(type || 'perspective') {
            case 'perspective':
                camera = new THREE.PerspectiveCamera(fieldOfView, 1, nearPlane, farPlane);
                break;
            case 'orthographic':
                let f = frustrum || 50;
                camera = new THREE.OrthographicCamera(-f, f, f / aspect, -f / aspect, nearPlane, farPlane);
                break;
        }
        
        camera.position.set(0, 10, 100);
        camera.lookAt(new THREE.Vector3(0,0,0));
        return camera;
    }

    initLights(){
        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, 0.3),
        };
        this.scene.add(lights.ambient);
        return lights;
    }

    initSubjects(scene){
        const subjects = {
        };
        const axesHelper = new THREE.AxesHelper( 500 );
        this.scene.add( axesHelper );
        return subjects;
    }

    initControls() {
        const controls = {
        };

        return controls;
    }

    initHelpers() {
        const helpers = {
            fpc: new FirstPersonControls(this.camera)
        }
        return helpers;
    }

    addSubjectToScene() {

    }

    onWindowResize(newWidth, newHeight){
        this.screenDimensions.width = newWidth;
        this.screenDimensions.height = newHeight;
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newWidth, newHeight);
    }
};