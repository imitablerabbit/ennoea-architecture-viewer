#include <fog_pars_vertex>

// Pass the vertex position to the fragment shader.
varying vec3 vPosition;

void main() {
    vPosition = position;

    #include <begin_vertex>
    // This is also required for the fog.
    // See https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/project_vertex.glsl.js#LL10
    #include <project_vertex> 
    #include <fog_vertex>
}
