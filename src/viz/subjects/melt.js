const d3Color = require('d3-color');
const d3Interpolate = require('d3-interpolate');
const d3Chromatic = require('d3-scale-chromatic');

class Melt {
    constructor(scene, data, params) {

        // SCENE
        this.scene = scene;

        // PARAMS
        this.width = params.width;
        this.height = params.height;
        this.padding = params.padding;
        this.nsx = data.sampleMetaData.nsx;
        this.nsy = data.sampleMetaData.nsy;
        this.shapeSize = (this.width / (this.nsx - 1)) - (2*this.padding);
        this.shapes = [];

        this.createPixels(data);
    }

    createPixels(data){
        const count = data.sampleMatrix.length;
        const geo = new THREE.PlaneGeometry(this.shapeSize, this.shapeSize, 8, 8);
        for(let i = 0; i < count; i++){
            let sample = data.sampleMatrix[i];
            let material = new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                emissive: new THREE.Color(`rgb(
                    ${Math.floor(sample.rAvg)}, 
                    ${Math.floor(sample.gAvg)}, 
                    ${Math.floor(sample.bAvg)})`),
                metalness: 0.2
            });
            let mesh = new THREE.Mesh(geo, material);
            mesh.position.set(
                sample.sx * (this.shapeSize + 2*this.padding) - 0.5*this.width,
                0.5*this.height - sample.sy * (this.shapeSize + 2*this.padding),
                0//500*(sample.rAvg+sample.gAvg+sample.bAvg)/(255*3)
            )
            this.scene.add(mesh);
        }
    }

    update() {

    }
}
module.exports = Melt;