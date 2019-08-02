const d3Color = require('d3-color');
const d3Interpolate = require('d3-interpolate');
const d3Chromatic = require('d3-scale-chromatic');

class PixelGrid {
    constructor(scene, data, params) {

        // SCENE
        this.scene = scene;

        // PARAMS
        this.nsx = data.sampleMetaData.nsx;
        this.nsy = data.sampleMetaData.nsy;
        this.width = params.width;
        this.height = params.height;
        this.padding = params.padding;
        this.shapeSize = (this.width / (this.nsx - 1)) - (2*this.padding);
        this.shapes = [];
        this.createShapes(data); 
    }

    createShapes(data){
        const count = data.sampleMatrix.length;
        const geo = new THREE.SphereGeometry(this.shapeSize, 8, 8);
        for(let i = 0; i < count; i++){
            let sample = data.sampleMatrix[i];
            let material = new THREE.MeshToonMaterial({
                color: new THREE.Color(`rgb(
                        ${Math.floor(sample.rAvg)}, 
                        ${Math.floor(sample.gAvg)}, 
                        ${Math.floor(sample.bAvg)})`),
                reflectivity: 100,
                shininess: 100,
            });
            let mesh = new THREE.Mesh(geo, material);
            mesh.position.set(
                0.5*this.width - sample.sx * (this.shapeSize + 2*this.padding),
                0.5*this.height - sample.sy * (this.shapeSize + 2*this.padding),
                0
            )
            
            let pivot = new THREE.Group();
            pivot.add(mesh);
            this.scene.add(pivot);

            this.shapes.push({
                pivot: pivot,
                sx: sample.sx,
                sy: sample.sy
            });
        }
    }

    update() {
        const alpha = .15; // higher number makes the rotation twist further
        const beta = 0.40; // higher number makes the rotation faster
        const speed = alpha*Math.sin(this.clock.getElapsedTime()*beta);

        for(let i = 0; i < this.shapes.length; i++){
            const shape = this.shapes[i];
            shape.pivot.rotation.y = (speed*(shape.sx + shape.sy));
        }
    }
}
module.exports = PixelGrid;