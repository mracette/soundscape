/* eslint-disable */ 

import SceneManager from '../SceneManager';
import * as THREE from 'three';
import * as d3Chromatic from 'd3-scale-chromatic';
import morningsModel from '../../models/soundscape-mornings-test.glb';

export default class Mornings extends SceneManager {

    constructor(canvas) {

        super(canvas, null);

        super.init().then(() => {
            this.loadModels();
        })

    }

    loadModels() {
        //this.scene.background = new THREE.Color('#FF0000')
        this.helpers.gltfLoader.load(morningsModel, (gltf) => {
            console.log(gltf);
            this.scene.add(gltf.scene);
            gltf.scene.getObjectByName('Spot').children[0].intensity = .1;
            gltf.scene.getObjectByName('Sun').children[0].intensity = 10;
            gltf.scene.children.filter(obj => obj.type === 'Mesh').map((mesh) => {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            });
            //this.camera = gltf.scene.getObjectByName('Camera');
            // model.scene.children.map((obj) => {
            //     this.scene.add(obj);
            // })
        })
        
        super.animate();
    }

    render() {
        this.controls.fpc.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
        console.log('r');
    }

}