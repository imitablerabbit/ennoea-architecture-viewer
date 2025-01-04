#include <fog_pars_vertex>

// The time in seconds since the start of the scene. This
// is increased by 1 every second.
uniform float time;

// The position of the source and target of the pulse.
uniform vec3 sourcePosition;
uniform vec3 targetPosition;

// The color of the source and target of the pulse.
uniform vec3 sourceColor;
uniform vec3 targetColor;

// The percentage of the line that the pulse will cover.
uniform float pulsePercent;

// The rate at which the pulses move from the target to the source.
uniform float inRate;
uniform float outRate;

// The size of the packets that are sent.
uniform float inPacketSize;
uniform float outPacketSize;

// Pass the vertex position to the fragment shader.
varying vec3 vPosition;

// Determine if the position is part of the pulse.
bool isPartOfPulse(float distanceFromComponent, float pulsePoint, float linePercent) {
    return distanceFromComponent >= pulsePoint - linePercent &&
           distanceFromComponent <= pulsePoint + linePercent;
}

// Apply the pulse to the vertex. If the vertex is part of the pulse, scale the vertex
// out along the normal direction.
vec3 applyPulse(vec3 pos, float distanceFromComponent, float packetScaleAmount, float t) {

    // Work out the distance between the source and target.
    float lineLength = distance(sourcePosition, targetPosition);

    // How far along the line should the vertex change.
    float linePercent = lineLength * pulsePercent;

    // Calculate the pulse center point.
    float pulsePoint = lineLength * t;

    // If the vertex is part of the pulse, scale the vertex along the normal.
    // The amount that the vertex is scaled is based on the distance from the
    // pulse point.
    if (isPartOfPulse(distanceFromComponent, pulsePoint, linePercent)) {
        float basicScaleAmount = 0.04;
        vec3 maxScale = normal * basicScaleAmount * packetScaleAmount;

        // The scale is based on the distance from the pulse point.
        float scaleAmount = 1.0 - (abs(pulsePoint - distanceFromComponent) / linePercent);
        vec3 scale = maxScale * scaleAmount;
       
        // Scale the vertex.
        pos = pos + scale;
    }

    return pos;
}

void main() {
    #include <begin_vertex>

    // This is also required for the fog.
    // See https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/project_vertex.glsl.js#LL10
    #include <project_vertex>

    #include <fog_vertex>

    // Scale out the position based on the normal. We want to fatten
    // the object based on the normal.
    // vec3 newPosition = position + normal * 0.1;

    // Change time to a value between 0 and 1. This will be used to
    // calculate the position of the pulse. If this value is 0, the
    // pulse will be at the source. If this value is 1, the pulse will
    // be at the target.
    float t = mod(time, 1.0);

    // Work out the distance from the source and target.
    float distanceFromSource = distance(sourcePosition, position);
    float distanceFromTarget = distance(targetPosition, position);
    
    // Normalize the rates. Keep them between 0 and 1 but maintain the
    // ratio between the two rates.
    float inRateNormal = inRate / (inRate + outRate);
    float outRateNormal = outRate / (inRate + outRate);
    inRateNormal += 1.0;
    outRateNormal += 1.0;

    // Determine the amount that we should scale using the packet size.
    float packetMax = 10000.0;
    float packetScaleMax = 3.0;
    float packetScaleChange = 4.0;
    float inPacketSizeNormal = inPacketSize / packetMax;
    float outPacketSizeNormal = outPacketSize / packetMax;
    inPacketSizeNormal *= packetScaleChange;
    outPacketSizeNormal *= packetScaleChange;
    inPacketSizeNormal = clamp(inPacketSizeNormal, 1.0, packetScaleMax);
    outPacketSizeNormal = clamp(outPacketSizeNormal, 1.0, packetScaleMax);

    // Determine if the pulse should be applied for each direction.
    bool shouldInPulse = inRate > 0.0;
    bool shouldOutPulse = outRate > 0.0;

    // Apply the pulse to the color.
    vec3 newPosition = position;
    if (shouldInPulse) {
        newPosition = applyPulse(newPosition, distanceFromTarget, inPacketSizeNormal, t * inRateNormal);
    }
    if (shouldOutPulse) {
        newPosition = applyPulse(newPosition, distanceFromSource, outPacketSizeNormal, t * outRateNormal);
    }

    // Pass the position to the next stage.
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    // Pass the vertex position to the fragment shader.
    vPosition = newPosition;
}
