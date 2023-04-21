#define USE_MAP

precision mediump float;
precision mediump int;

varying vec3 vPosition;
varying vec2 vUv;

uniform sampler2D map;

// #include <map_pars_fragment>
// #include <encodings_pars_fragment>

vec4 generic_desaturate(vec3 color, float factor)
{
	vec3 lum = vec3(0.299, 0.587, 0.114);
	vec3 gray = vec3(dot(lum, color));
	return vec4(mix(color, gray, factor), 1.0);
}

void main()	{

    // #include <map_fragment>

    vec4 texColor = texture2D( map, vUv );
    texColor = generic_desaturate(texColor.xyz, 1.);

    gl_FragColor = vec4 ( texColor.xyz * .2, 1. );

    // #include <encodings_fragment>

}