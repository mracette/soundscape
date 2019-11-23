import * as THREE from 'three';

// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
export class BirdGeometry extends THREE.BufferGeometry {

    constructor() {

        super();

        var WIDTH = 8;
        var BIRDS = WIDTH * WIDTH;

        var triangles = BIRDS * 3;
        var points = triangles * 3;
        var vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
        var birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
        var references = new THREE.BufferAttribute(new Float32Array(points * 2), 2);
        var birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);

        this.addAttribute('position', vertices);
        this.addAttribute('birdColor', birdColors);
        this.addAttribute('reference', references);
        this.addAttribute('birdVertex', birdVertex);

        var v = 0;
        function verts_push() {
            for (var i = 0; i < arguments.length; i++) {
                vertices.array[v++] = arguments[i];
            }
        }
        var wingsSpan = 20;
        for (var f = 0; f < BIRDS; f++) {
            // Body
            verts_push(
                0, - 0, - 20,
                0, 4, - 20,
                0, 0, 30
            );
            // Left Wing
            verts_push(
                0, 0, - 15,
                - wingsSpan, 0, 0,
                0, 0, 15
            );
            // Right Wing
            verts_push(
                0, 0, 15,
                wingsSpan, 0, 0,
                0, 0, - 15
            );
        }

        for (var v = 0; v < triangles * 3; v++) {
            var i = ~ ~(v / 3);
            var x = (i % WIDTH) / WIDTH;
            var y = ~ ~(i / WIDTH) / WIDTH;
            var c = new THREE.Color(
                0x444444 +
                ~ ~(v / 9) / BIRDS * 0x666666
            );
            birdColors.array[v * 3 + 0] = c.r;
            birdColors.array[v * 3 + 1] = c.g;
            birdColors.array[v * 3 + 2] = c.b;
            references.array[v * 2] = x;
            references.array[v * 2 + 1] = y;
            birdVertex.array[v] = v % 9;
        }

        this.scale(0.1, 0.1, 0.1);

    }

};