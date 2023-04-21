precision mediump float;
precision mediump int;

varying vec3 vPosition;
varying vec2 vUv;

void main()	{

    vPosition = position;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}