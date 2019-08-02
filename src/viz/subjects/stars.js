/**
 * Creates a set of 'stars' using an efficient buffer geometry implementation. 
 * The stars move together in orbit around a center point.
 * @module Stars
 */

class Stars {
    /**
    * @param {object} scene - the THREE.js scene
    * @param {object} center - Vector3: the center of the star field (which is a sphere)
    * @param {number} radius - the radius of the star field (bigger = smaller stars)
    * @param {number} number - the number of stars to display
    * @param {object} params - optional parameters (see documentation)
    */
   constructor(scene, center, radius, number, params) {
       
       // required parameters
       this.scene = scene;
       this.center = center;
       this.radius = radius;
       this.number = number;

       // assign given parameters or defaults to class object
       Object.assign(this, {
           color: 0xffffff,
           colorPalette: null,
           intensityMap:[[0,1,1,1]],
           radiusSpread: 0,
           minOrbitRadius: radius,
           maxOrbitRadius: radius,
           orbitSpeed: 0.1,
           rotateVector: new THREE.Vector3(1,1,1),
       }, params);

       // check that the intensity map is valid
       for(let i = 0; i < this.intensityMap.length; i++){
           let m = this.intensityMap[i];
           for(let j = 0; j < m.length; j++){
               if(this.intensityMap[i][j] > 1){
                   console.warn("intensity and cycles positions must all be less than or \
                   equal to 1. See documentation for details. Using default intensity map \
                   instead.");
                   this.intensityMap = [[0,1,1,1]];
               }
           }
       }

       // add THREE elements
       this.group = new THREE.Group();
       this.starField = this.createSpheres(this.number); 
       this.group.position.copy(this.center);
       this.scene.add(this.group);
   }

   guassianRand(){
       var rand = 0;
       for (var i = 0; i < 6; i += 1) {
           rand += Math.random();
       }
       return rand / 6;
   }

   normalize(x,y,z,r){
       const nX = r*x/Math.sqrt(x*x+y*y+z*z)
       const nY = r*y/Math.sqrt(x*x+y*y+z*z)
       const nZ = r*z/Math.sqrt(x*x+y*y+z*z)
       return {
           x: nX,
           y: nY,
           z: nZ
       };
   }

   createSpheres(n){

       let geometry = new THREE.BufferGeometry();
       let positions = [];
       let intensities = [];
       let color;
       let colors = [];

       for(let i = 0; i < n; i++){
           let randomCoords = this.normalize(
               -1+2*this.guassianRand(),
               -1+2*this.guassianRand(),
               -1+2*this.guassianRand(),
               this.minOrbitRadius + Math.random() * (this.maxOrbitRadius-this.minOrbitRadius)
           );
           positions.push(randomCoords.x);
           positions.push(randomCoords.y);
           positions.push(randomCoords.z);
           intensities.push(1);
           if(this.colorPalette){
               color = new THREE.Color(this.colorPalette(Math.random()));
           } else {
               color = new THREE.Color(this.color);
           }
           colors.push(color.r, color.g, color.b, 1);
       }

       geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
       geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
       geometry.addAttribute('intensity', new THREE.Float32BufferAttribute(intensities, 1));
       geometry.setDrawRange(0,n);

       let material = new THREE.PointsMaterial({
           vertexColors: THREE.VertexColors,
           transparent: true,
           opacity: 1
       });

       let starField = new THREE.Points(geometry, material);

       starField.geometry.attributes.position.needsUpdate = true;

       this.group.add(starField);

       return starField;
   }

   update(delta, cyclePosition) {
       let c = (cyclePosition !== undefined) ? cyclePosition : 0;
       this.group.rotateOnAxis(this.rotateVector.normalize(), (delta*this.orbitSpeed*2*Math.PI)/60);
       let intensity = this.getIntensity(c);
       this.starField.material.opacity = intensity;
   }

   getIntensity(cyclePosition) {
       let index = null;
       let map;
       let i = 0;
       while(index == null) {
           if(cyclePosition >= this.intensityMap[i][0] && cyclePosition < this.intensityMap[i][1]){
               map = this.intensityMap[i];
               index = i;
           }
           if(i > this.intensityMap.length){
               console.warn("Intensity map should provide output values for all cycle positions between\
               [0,1). Using intensity = 1 instead.");
               map = [0,1,1,1];
               index = -1;
           }
           i++;
       }
       let value = this.lerp(map[2], map[3], (cyclePosition - map[0])/(map[1] - map[0]));
       return value;
   }

   lerp(v0, v1, t) {
       return v0*(1-t)+v1*t;
   }

}
module.exports = Stars;