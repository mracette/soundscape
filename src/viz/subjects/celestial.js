/**
 * Creates a 'celestial object', which is a directional light combined
 * source with other celestial-like elements, such as a lensflare or a
 * sphere. The group of elements move together in a circular orbit.
 * @module Celestial
 */

class Celestial {
     /**
     * @param {object} scene - the THREE.js scene
     * @param {object} position - Vector3: the initial position of the object
     * @param {object} orbitCenter - Vector3: the center of orbit
     * @param {number} orbitSpeed - rotations per minute
     * @param {object} params - optional parameters
     */
    constructor(scene, position, orbitCenter, orbitSpeed, params) {

        // required parameters
        this.scene = scene;
        this.position = position;
        this.orbitCenter = orbitCenter;
        this.orbitSpeed = orbitSpeed;

        // optional parameters
        this.lightColor = new THREE.Color(params.lightColor) || new THREE.Color(0xffffff);
        this.intensityMap = params.intensityMap || [[0,1,1,1]];
        this.maxIntensity = params.maxIntensity || 1;
        this.helper = params.helper || false;
        this.orbitAxis = params.orbitOffset || new THREE.Vector3(0,0,1);
        this.lensflare = params.lensflare || false;
        this.sphere = params.sphere || false;
        this.sphereColor = params.sphereColor || 0xfffffff;
        this.sphereOpacity = params.sphereOpacity || 1;
        this.sphereSize = params.sphereSize || 50;

        // checks
        let err;
        for(let i = 0; i < this.intensityMap.length; i++){
            let m = this.intensityMap[i];
            for(let j = 0; j < m.length; j++){
                if(this.intensityMap[i][j] > 1){
                    err += "Error: intensity and cycles positions must all be less than or\
                    equal to 1. See documentation for details. Using default intensity map\
                    instead.";
                    this.intensityMap = [[0,1,1,1]];
                }
            }
        }

        // add THREE elements
        this.pivot = new THREE.Group; 
        this.pivot.position.copy(this.orbitCenter);
        this.dirLight = this.createLights(this.helper, this.lensflare);
        if(this.sphere){this.sphere = this.createSphere();}

        // group all elements and add to scene
        this.group = new THREE.Group;
        this.group.add(this.pivot)
        this.scene.add(this.group);
    }

    createLights(helper, flare) {

        // configure a directional light to mimic the output of a sun or other body
        let dirLight = new THREE.DirectionalLight(this.lightColor, this.intensity);
        let dirLightTarget = new THREE.Object3D();
        this.scene.add(dirLightTarget);
        dirLight.target = dirLightTarget;
        dirLight.position.copy(this.position);

        // configure shadows
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1000;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.bias = 0.0001;
        dirLight.shadow.camera.lookAt(this.orbitCenter);

        if(helper){this.createCameraHelper(dirLight);}
        if(flare){this.addLensFlare(dirLight);}

        this.pivot.add(dirLight);

        return dirLight;
    }

    addLensFlare(light) {
        let textureLoader = new THREE.TextureLoader();

        let textureFlare0 = textureLoader.load( "textures/lensflare/lensflare0.png" );
        let textureFlare3 = textureLoader.load( "textures/lensflare/lensflare3.png" );

        let lensflare = new THREE.Lensflare();

        let mainElement = new THREE.LensflareElement( textureFlare0, 700, 0, light.color ) 

        lensflare.addElement(mainElement);
        lensflare.addElement(new THREE.LensflareElement(textureFlare3, 60, 0.6, light.color));
        lensflare.addElement(new THREE.LensflareElement(textureFlare3, 70, 0.7, light.color));
        lensflare.addElement(new THREE.LensflareElement(textureFlare3, 120, 0.9, light.color));
        lensflare.addElement(new THREE.LensflareElement(textureFlare3, 70, 1, light.color));

        light.add( lensflare );

        this.lensflare = lensflare;
        this.lensflare.mainElement = mainElement;
    }

    createCameraHelper(light) {
        let helper = new THREE.CameraHelper(light.shadow.camera);
        helper.position.copy(this.position);
        this.pivot.add(helper);
        return helper;
    }

    createSphere() {
        let sphereGeo = new THREE.SphereGeometry(this.sphereSize, 32, 32);
        let sphereMat = new THREE.MeshBasicMaterial({color: this.sphereColor, transparent: true, opacity: this.sphereOpacity});
        let sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.copy(this.position);
        this.pivot.add(sphere);
        return sphere;
    }

    update(delta, cyclePosition) {
        this.pivot.rotateOnAxis(this.orbitAxis, (delta*this.orbitSpeed*2*Math.PI)/60);
        let intensity = this.getIntensity(cyclePosition);
        this.dirLight.intensity = intensity;
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
module.exports = Celestial;