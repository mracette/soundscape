precision mediump float;
precision mediump int;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;

uniform float size;
uniform float scale;

void main()	{

    vPosition = position;
    vNormal = normal;
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * mix(1., .5, position.z);

}