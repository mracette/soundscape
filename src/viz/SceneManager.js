/* eslint-disable */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import FirstPersonControls from './controls/FirstPersonControls';

export class SceneManager {

    constructor(canvas) {

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
        this.onWindowResize = this.onWindowResize.bind(this);

    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // lights, camera, action
                this.scene = this.initScene();
                this.renderer = this.initRender();
                this.camera = this.initCamera('perspective');
                this.controls = this.initControls();
                this.subjects = {};
                this.lights = this.initLights();
                this.helpers = this.initHelpers();
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }

    animate() {
        console.log('gong');
        //this.helpers.stats.begin();
        this.render();
        //this.helpers.stats.end();
        requestAnimationFrame(this.animate);
    }

    render() {
        // overridden by child class
    }

    initScene() {
        const scene = new THREE.Scene();
        return scene;
    }

    initRender() {

        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;

        renderer.setSize(this.screenDimensions.width, this.screenDimensions.height);
        renderer.setPixelRatio(DPR);

        return renderer;
    }

    initCamera(type, frustrum) {

        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 10000;
        const aspect = this.screenDimensions.width / this.screenDimensions.height;
        let camera;

        switch (type || 'perspective') {
            case 'perspective':
                camera = new THREE.PerspectiveCamera(fieldOfView, 1, nearPlane, farPlane);
                break;
            case 'orthographic':
                let f = frustrum || 50;
                camera = new THREE.OrthographicCamera(-f, f, f / aspect, -f / aspect, nearPlane, farPlane);
                break;
        }

        camera.aspect = aspect;
        camera.position.set(0, 10, 115);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.updateProjectionMatrix();
        return camera;
    }

    initControls() {
        const controls = {
            fpc: new FirstPersonControls(this.camera)
        };

        return controls;
    }

    initLights() {
        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, .1)
        }
        this.scene.add(lights.ambient);
        this.lights = lights;
    }

    initHelpers() {
        // const stats = new Stats();
        // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        // stats.dom.style.left = null;
        // stats.dom.style.right = '0px';
        // document.body.appendChild( stats.dom );

        const helpers = {
            // stats: stats,
            gltfLoader: new GLTFLoader()
        }
        return helpers;
    }

    onWindowResize() {
        console.log('resize');
        const newWidth = window.width;
        const newHeight = window.height;
        this.screenDimensions.width = newWidth;
        this.screenDimensions.height = newHeight;
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newWidth, newHeight);
    }
};