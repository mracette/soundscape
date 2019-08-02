const d3Color = require('d3-color');
const d3Interpolate = require('d3-interpolate');
const d3Chromatic = require('d3-scale-chromatic');

class SolarFarm {
    constructor(scene, data, params) {

        // SCENE
        this.scene = scene;

        // PARAMS
        this.maxRotate = THREE.Math.degToRad(360);
        this.nsx = data.sampleMetaData.nsx;
        this.nsy = data.sampleMetaData.nsy;
        this.width = params.width;
        this.height = params.height;
        this.padding = params.padding;
        this.shapeSize = (this.width / (this.nsx - 1)) - (2*this.padding);
        this.shapes = [];
        this.rotateGroup = new THREE.Group();
        this.createShapes(data); 
    }

    createShapes(data){
        const count = data.sampleMatrix.length;
        const geo = new THREE.BoxGeometry(this.shapeSize, this.shapeSize, this.shapeSize, 1, 1);
        //const geo = new THREE.SphereGeometry(this.shapeSize,8,8);
        for(let i = 0; i < count; i++){
            let sample = data.sampleMatrix[i];
            let material = new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                color: new THREE.Color(`rgb(
                    ${Math.floor(sample.rAvg)}, 
                    ${Math.floor(sample.gAvg)}, 
                    ${Math.floor(sample.bAvg)})`),
                metalness: 0.2
            });
            let mesh = new THREE.Mesh(geo, material);
            // mesh.position.set(
            //     sample.sx * (this.shapeSize + 2*this.padding) - 0.5*this.width,
            //     0.5*this.height - sample.sy * (this.shapeSize + 2*this.padding),
            //     0//500*(sample.rAvg+sample.gAvg+sample.bAvg)/(255*3)
            // )

            mesh.position.setFromSpherical(
                new THREE.Spherical(150, (sample.sx / this.nsx) * this.maxRotate, 0)
            );
            //mesh.translateY(0.5*this.height - sample.sy * (this.shapeSize + 2*this.padding));
            mesh.rotateX(THREE.Math.degToRad(90) + (sample.sx / this.nsx) * this.maxRotate);

            let pivot = new THREE.Group();
            //pivot.position.set(0,mesh.position.y,0);
            pivot.add(mesh);
            pivot.rotateY(THREE.Math.degToRad(90));
            pivot.translateX(0.5*this.height - sample.sy * (this.shapeSize + 2*this.padding));

            this.rotateGroup.add(pivot);

            //this.scene.add(pivot);

            this.shapes.push({
                pivot: pivot,
                sx: sample.sx,
                sy: sample.sy
            });
        }
        this.scene.add(this.rotateGroup);
    }

    update() {
        const alpha = .15; // higher number makes the rotation twist further
        const beta = 0.040; // higher number makes the rotation faster
        
        this.rotateGroup.rotateZ(0.004);

        // for(let i = 0; i < this.shapes.length; i++){
        //     const shape = this.shapes[i];
        //     shape.pivot.children[0].rotateX(beta*(i/this.shapes.length));
        // }
    }
}
module.exports = SolarFarm;