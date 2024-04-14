precision mediump float;
precision mediump int;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;

uniform vec3 diffuse;
uniform vec3 background;
uniform sampler2D map;

void main()	{

    float opacity = .6 * (1. - vPosition.y);
    
    vec4 texColor = texture2D( map, gl_PointCoord );

    gl_FragColor = vec4 ( vColor.xyz, texColor.w * opacity );

}