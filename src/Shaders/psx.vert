uniform float jitter;
uniform ivec2 resolution;

varying vec2 vUv;

vec4 snap_to_position(vec4 base_position, vec2 resolution, float jitter) {
    vec4 snapped_position = base_position;
    snapped_position.xyz /= base_position.w;

    vec2 snap_res = floor(vec2(resolution) * (1.0 - jitter));
    snapped_position.x = floor(snap_res.x * snapped_position.x) / snap_res.x;
    snapped_position.y = floor(snap_res.y * snapped_position.y) / snap_res.y;

    snapped_position.xyz *= base_position.w;
    return snapped_position;
}

void main() {
    vUv = uv;
    vec4 snapped_position = snap_to_position(projectionMatrix*modelViewMatrix * vec4(position,1.0), vec2(resolution), jitter);
    gl_Position = snapped_position;
}
