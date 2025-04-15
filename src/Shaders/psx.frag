uniform sampler2D albedo;
uniform float time;
uniform vec3 color;
varying vec2 vUv;
void main() {
    gl_FragColor = texture(albedo, vUv);
}