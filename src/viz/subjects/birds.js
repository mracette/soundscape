import * as THREE from 'three';
import { fragmentShaderPos, fragmentShaderVel, vertexShader, geometryShader } from '../shaders/birds';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { BirdGeometry } from '../subjects/birdGeometry';

export class Birds {

    constructor(scene, camera, renderer) {

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.WIDTH = 8;
        this.BIRDS = this.WIDTH * this.WIDTH;

        this.mouseX = 0;
        this.mouseY = 0;
        // this.windowHalfX = window.innerWidth / 2;
        // this.windowHalfY = window.innerHeight / 2;

        this.windowHalfX = 10;
        this.windowHalfY = 10;

        this.BOUNDS = 100
        this.BOUNDS_HALF = this.BOUNDS / 2;
        this.last = performance.now();
        this.gpuCompute = null;
        this.velocityVariable = null;
        this.positionVariable = null;
        this.positionUniforms = null;
        this.velocityUniforms = null;
        this.birdUniforms = null;

        this.init();

    }

    init() {

        this.initComputeRenderer();

        var effectController = {
            separation: 20.0,
            alignment: 20.0,
            cohesion: 20.0,
            freedom: 0.75
        };

        this.velocityUniforms["separationDistance"].value = effectController.separation;
        this.velocityUniforms["alignmentDistance"].value = effectController.alignment;
        this.velocityUniforms["cohesionDistance"].value = effectController.cohesion;
        this.velocityUniforms["freedomFactor"].value = effectController.freedom;

        this.initBirds();

    }

    initComputeRenderer() {

        this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);

        var dtPosition = this.gpuCompute.createTexture();
        var dtVelocity = this.gpuCompute.createTexture();

        this.fillPositionTexture(dtPosition);
        this.fillVelocityTexture(dtVelocity);

        this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", fragmentShaderVel, dtVelocity);
        this.positionVariable = this.gpuCompute.addVariable("texturePosition", fragmentShaderPos, dtPosition);

        this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable]);
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable]);

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.velocityUniforms = this.velocityVariable.material.uniforms;

        this.positionUniforms["time"] = { value: 0.0 };
        this.positionUniforms["delta"] = { value: 0.0 };
        this.velocityUniforms["time"] = { value: 1.0 };
        this.velocityUniforms["delta"] = { value: 0.0 };
        this.velocityUniforms["testing"] = { value: 1.0 };
        this.velocityUniforms["separationDistance"] = { value: 1.0 };
        this.velocityUniforms["alignmentDistance"] = { value: 1.0 };
        this.velocityUniforms["cohesionDistance"] = { value: 1.0 };
        this.velocityUniforms["freedomFactor"] = { value: 1.0 };
        this.velocityUniforms["predator"] = { value: new THREE.Vector3() };

        this.velocityVariable.material.defines.BOUNDS = this.BOUNDS.toFixed(2);
        this.velocityVariable.wrapS = THREE.RepeatWrapping;
        this.velocityVariable.wrapT = THREE.RepeatWrapping;
        this.positionVariable.wrapS = THREE.RepeatWrapping;
        this.positionVariable.wrapT = THREE.RepeatWrapping;

        var error = this.gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }
    }

    initBirds() {
        var geometry = new BirdGeometry();

        // For Vertex and Fragment
        this.birdUniforms = {
            "color": { value: new THREE.Color(0xff2200) },
            "texturePosition": { value: [null] },
            "textureVelocity": { value: null },
            "time": { value: 1.0 },
            "delta": { value: 0.0 }
        };

        // THREE.ShaderMaterial
        var material = new THREE.ShaderMaterial({
            uniforms: this.birdUniforms,
            vertexShader: vertexShader,
            fragmentShader: geometryShader,
            side: THREE.DoubleSide
        });

        var birdMesh = new THREE.Mesh(geometry, material);
        birdMesh.rotation.y = Math.PI / 2;
        birdMesh.matrixAutoUpdate = false;
        birdMesh.updateMatrix();
        this.scene.add(birdMesh);

    }

    fillPositionTexture(texture) {
        var theArray = texture.image.data;

        for (var k = 0, kl = theArray.length; k < kl; k += 4) {
            var x = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
            var y = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
            var z = Math.random() * this.BOUNDS - this.BOUNDS_HALF;
            theArray[k + 0] = x;
            theArray[k + 1] = y;
            theArray[k + 2] = z;
            theArray[k + 3] = 1;
        }

    }

    fillVelocityTexture(texture) {
        var theArray = texture.image.data;
        for (var k = 0, kl = theArray.length; k < kl; k += 4) {
            var x = Math.random() - 0.5;
            var y = Math.random() - 0.5;
            var z = Math.random() - 0.5;
            theArray[k + 0] = x * 10;
            theArray[k + 1] = y * 10;
            theArray[k + 2] = z * 10;
            theArray[k + 3] = 1;
        }
    }

    renderSubject() {
        var now = performance.now();
        var delta = (now - this.last) / 1000;
        if (delta > 1) delta = 1; // safety cap on large deltas
        this.last = now;
        this.positionUniforms["time"].value = now;
        this.positionUniforms["delta"].value = delta;
        this.velocityUniforms["time"].value = now;
        this.velocityUniforms["delta"].value = delta;
        this.birdUniforms["time"].value = now;
        this.birdUniforms["delta"].value = delta;
        this.velocityUniforms["predator"].value.set(0.5 * this.mouseX / this.windowHalfX, - 0.5 * this.mouseY / this.windowHalfY, 0);
        this.mouseX = 10000;
        this.mouseY = 10000;
        this.gpuCompute.compute();
        this.birdUniforms["texturePosition"].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
        this.birdUniforms["textureVelocity"].value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
        // renderer.render(this.scene, this.camera);
    }

}