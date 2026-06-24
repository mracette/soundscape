export const rgbaVertexLarge = `
attribute vec4 customColor;
varying vec4 vColor;
void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = 4.0;
    gl_Position = projectionMatrix * mvPosition;
}
`;

export const rgbaVertex = `
    attribute vec4 customColor;
    varying vec4 vColor;
    void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
`;

export const rgbaFragment = `
    varying vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }
`;
