class VisibleAxes {
    constructor(scene, params){
        this.scene = scene;
        this.upperBound = params.upperBound;
        this.group = new THREE.Group();
        this.createAxes();
    }
    createAxes(){
        const lightRed = new THREE.LineBasicMaterial({color: 0xff6666});
        const darkRed = new THREE.LineBasicMaterial({color: 0x990000});

        const lightGreen = new THREE.LineBasicMaterial({color: 0x66ff66});
        const darkGreen = new THREE.LineBasicMaterial({color: 0x009900});

        const lightBlue = new THREE.LineBasicMaterial({color: 0x6666ff});
        const darkBlue = new THREE.LineBasicMaterial({color: 0x000099});

        let xNegativeGeo = new THREE.Geometry();
        xNegativeGeo.vertices.push(
            new THREE.Vector3(-this.upperBound,0,0),
            new THREE.Vector3(0,0,0)
        );
        let xPositiveGeo = new THREE.Geometry();
        xPositiveGeo.vertices.push(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(this.upperBound,0,0)
        );

        let yNegativeGeo = new THREE.Geometry();
        yNegativeGeo.vertices.push(
            new THREE.Vector3(0,-this.upperBound,0),
            new THREE.Vector3(0,0,0)
        );
        let yPositiveGeo = new THREE.Geometry();
        yPositiveGeo.vertices.push(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,this.upperBound,0)
        );

        let zNegativeGeo = new THREE.Geometry();
        zNegativeGeo.vertices.push(
            new THREE.Vector3(0,0,-this.upperBound),
            new THREE.Vector3(0,0,0)
        );
        let zPositiveGeo = new THREE.Geometry();
        zPositiveGeo.vertices.push(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,this.upperBound)
        );

        let xNegativeAxis = new THREE.Line(xNegativeGeo, darkRed);
        let xPositiveAxis = new THREE.Line(xPositiveGeo, lightRed);

        let yNegativeAxis = new THREE.Line(yNegativeGeo, darkGreen);
        let yPositiveAxis = new THREE.Line(yPositiveGeo, lightGreen);

        let zNegativeAxis = new THREE.Line(zNegativeGeo, darkBlue);
        let zPositiveAxis = new THREE.Line(zPositiveGeo, lightBlue);

        this.group.add(xNegativeAxis);
        this.group.add(xPositiveAxis);
        this.group.add(yNegativeAxis);
        this.group.add(yPositiveAxis);
        this.group.add(zNegativeAxis);
        this.group.add(zPositiveAxis);

        this.scene.add(this.group);
        
    }
}
module.exports = VisibleAxes;