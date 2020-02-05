/* eslint-disable */

import * as THREE from 'three';
import Stats from 'stats.js';
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

        this.showStats = true;

    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // lights, camera, action
                this.scene = this.initScene();
                this.renderer = this.initRender();
                this.camera = this.initCamera('perspective');
                this.controls = this.initControls();
                this.subjects = this.initSubjects();
                this.lights = this.initLights();
                this.helpers = this.initHelpers();
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }

    animate() {
        this.showStats && this.helpers.stats.begin();
        this.render();
        this.showStats && this.helpers.stats.end();
        requestAnimationFrame(this.animate);
    }

    initScene() {
        const scene = new THREE.Scene();
        return scene;
    }

    initRender() {

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            canvas: this.canvas,
            antialias: true,
            powerPreference: "high-performance",
            outputEncoding: THREE.sRGBEncoding
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

        const controls = {};
        controls.fpc = new FirstPersonControls(this.camera);
        return controls;

    }

    initSubjects() {

        const subjects = {};
        return subjects;

    }

    initLights() {
        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, .1)
        }
        this.scene.add(lights.ambient);
        this.lights = lights;
    }

    initHelpers() {

        let stats = null;

        if (this.showStats) {
            stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            stats.dom.style.left = null;
            stats.dom.style.right = '0px';
            document.body.appendChild(stats.dom);
        }

        const helpers = {
            stats: stats,
            gltfLoader: new GLTFLoader()
        }

        return helpers;

    }

    onWindowResize() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        this.screenDimensions.width = newWidth;
        this.screenDimensions.height = newHeight;
        const aspectRatio = newWidth / newHeight;

        if (this.fovAdjust) {
            this.camera.fov = this.getNewFov(aspectRatio);
        }

        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newWidth, newHeight);
    }
};