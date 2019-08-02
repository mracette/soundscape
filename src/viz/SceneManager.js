import * as THREE from 'three';

export default class SceneManager {
    constructor(canvas){

        const $this = this;

        this.canvas = canvas;
        console.log(this.canvas);
        this.clock = new THREE.Clock(true);
        this.screenDimensions = {
            width: this.canvas.width,
            height: this.canvas.height
        }
        this.worldDimensions = {
            width: 1000,
            height: 1000,
            depth: 1000
        };

        function animateLoop() {
            requestAnimationFrame(animateLoop);
            $this.render()
        }

        this.init().then(() => {
            animateLoop();
        })

    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // lights, camera, action
                this.scene = this.initScene();
                this.renderer = this.initRender();
                this.camera = this.initCamera('perspective');
                this.lights = this.initLights();
                this.controls = this.initControls();
                this.helpers = this.initHelpers();
                resolve();
            } catch(e) {
                console.error(e);
                reject(e)
            }
        })
    }

    animate() {
        requestAnimationFrame(this.animate().bind(this));
        this.render();
    }

    render() {
        let d = this.clock.getDelta();
        let e = this.clock.getElapsedTime();
        this.renderer.render(this.scene, this.camera);
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
        const aspect = this.canvas.width / this.canvas.height;
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
        
        camera.position.set(0, 0, 50);
        return camera;
    }

    initLights(){
        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, 0.3),
        };
        this.scene.add(lights.ambient);
        return lights;
    }

    initSubjects(){
        const subjects = {
        };
        return subjects;
    }

    initControls() {
        const controls = {
        };

        return controls;
    }

    initHelpers() {
        const helpers = {

        }
        return helpers;
    }

    onWindowResize(newWidth, newHeight){
        this.screenDimensions.width = newWidth;
        this.screenDimensions.height = newHeight;
        this.camera.aspect = this.screenDimensions.width / this.screenDimensions.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.screenDimensions.width, this.screenDimensions.height);
    }
};