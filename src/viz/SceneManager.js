import * as THREE from 'three';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import FirstPersonControls from './controls/FirstPersonControls';
import { cinematicResize } from '../utils/jsUtils';

export class SceneManager {

    constructor(canvas) {

        this.canvas = canvas;

        this.clock = new THREE.Clock(true);

        this.sceneDimensions = {
            width: this.resizeMethod === 'cinematic' ? canvas.width : window.innerWidth,
            height: this.resizeMethod === 'cinematic' ? canvas.height : window.innerHeight,
        }

        this.worldDimensions = {
            width: 1000,
            height: 1000,
            depth: 1000
        };

        this.resizeMethod = null;
        this.pauseVisuals = false;
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

    stop() {
        window.cancelAnimationFrame(this.currentFrame);
    }

    applyAll(obj, callback, exceptions = []) {
        obj.children.forEach((child) => {
            if (child.children.length > 0) {
                this.applyAll(child, callback, exceptions);
            } else {
                if (!exceptions.find((ex) => child.name.includes(ex))) {
                    callback(child);
                }
            }
        })
    }

    disposeAll(obj) {
        while (obj.children.length > 0) {
            this.disposeAll(obj.children[0])
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose()

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return
                if (typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose()
            })
            obj.material.dispose()
        }
    }

    animate() {
        this.showStats && this.helpers.stats.begin();
        this.render();
        this.showStats && this.helpers.stats.end();
        this.currentFrame = requestAnimationFrame(this.animate);
    }

    initScene() {
        const scene = new THREE.Scene();
        return scene;
    }

    initRender() {

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            autoClear: false,
            canvas: this.canvas,
            antialias: true,
            outputEncoding: THREE.sRGBEncoding
        });

        let DPR = Math.min(this.DPRMax || 1.5, (window.devicePixelRatio) ? window.devicePixelRatio : 1);

        renderer.setPixelRatio(DPR);
        renderer.setSize(this.sceneDimensions.width, this.sceneDimensions.height);

        return renderer;
        
    }

    initCamera(type, frustrum) {

        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 10000;
        const aspect = this.sceneDimensions.width / this.sceneDimensions.height;
        let camera;

        switch (type || 'perspective') {
            case 'perspective':
                camera = new THREE.PerspectiveCamera(fieldOfView, 1, nearPlane, farPlane);
                break;
            case 'orthographic':
                let f = frustrum || 50;
                camera = new THREE.OrthographicCamera(-f, f, f / aspect, -f / aspect, nearPlane, farPlane);
                break;
            default: break;
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
            gltfLoader: new GLTFLoader(),
        }

        return helpers;

    }

    getNewFov(aspectRatio) {
        // if(this.resizeMethod === 'fullscreen') {
            const aspectAdj = Math.max(this.aspectMin, Math.min(aspectRatio, this.aspectMax));
            const newFov = this.fovMax - (this.fovMax - this.fovMin) * (aspectAdj - this.aspectMin) / (this.aspectMax - this.aspectMin);
            return newFov;
        // } else if (this.resizeMethod === 'cinematic') {

        // }
    }

    onWindowResize() {

        this.resizeMethod === 'cinematic' && cinematicResize(this.canvas);

        const newWidth = (this.resizeMethod === 'cinematic') ? 
            this.canvas.width : 
            window.innerWidth;

        const newHeight = (this.resizeMethod === 'cinematic') ? 
            this.canvas.height : 
            window.innerHeight;

        this.sceneDimensions.width = newWidth;
        this.sceneDimensions.height = newHeight;

        const aspectRatio = newWidth / newHeight;

        if (this.fovAdjust) {
            this.camera.fov = this.getNewFov(aspectRatio)
        } else {
            this.camera.fov = this.fov;
        }

        console.log(newWidth, newHeight);

        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newWidth, newHeight);
        this.render(true);
    }

    loadModel(options = {}) {

        const { name } = options;
        const format = process.env[`REACT_APP_MODEL_FORMAT_${this.songId.toUpperCase()}`] ||
            process.env.REACT_APP_MODEL_FORMAT;

        let ext;

        if (format === 'glb') {
            ext = '.glb';
        } else {
            ext = '.gltf';
        }

        return new Promise((resolve, reject) => {

            let url;

            if (process.env.REACT_APP_ASSET_LOCATION === 'local') {

                url = `${process.env.PUBLIC_URL}/models/${this.songId}/${name}${ext}`;

            } else if (process.env.REACT_APP_ASSET_LOCATION === 's3') {

                url = `https://soundscape-public.s3.us-east-2.amazonaws.com/app/models/${this.songId}/${format}/${name}${ext}`;

            }

            console.log(url);

            this.helpers.gltfLoader.load(
                url,
                (model) => resolve(model),
                null,
                (err) => reject(err)
            );

        });

    }

};