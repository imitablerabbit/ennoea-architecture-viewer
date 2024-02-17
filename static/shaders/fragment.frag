#include <fog_pars_fragment>

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

// The rate at which the pulses move from the source to the target.
uniform float outRate;

varying vec3 vPosition;

// Determine if the fragment is part of the pulse.
bool isPartOfPulse(float distanceFromComponent, float pulsePoint, float lineColorPercent) {
    return distanceFromComponent >= pulsePoint - lineColorPercent &&
           distanceFromComponent <= pulsePoint + lineColorPercent;
}

// Apply the pulse to the color. If the fragment is part of the pulse, change the color.
vec3 applyPulse(vec3 color, vec3 pulseColor, float distanceFromComponent, float t) {

    // Work out the distance between the source and target.
    float lineLength = distance(sourcePosition, targetPosition);

    // How far along the line should the color change.
    float lineColorPercent = lineLength * pulsePercent;

    // Calculate the pulse color start and end points.
    float pulsePoint = lineLength * t;

    // If the fragment is part of the pulse, change the color.
    if (isPartOfPulse(distanceFromComponent, pulsePoint, lineColorPercent)) {
        color = mix(pulseColor, color, smoothstep(0.0, lineColorPercent, abs(distanceFromComponent - pulsePoint)));
    }

    return color;
}

void main() {
    // The output color of the fragment. By default it is the same
    // color as the source component.
    vec3 color = sourceColor;

    // The color of the fragment if it is part of the pulse.
    vec3 pulseColor = vec3(1.0, 1.0, 1.0);

    // Change time to a value between 0 and 1. This will be used to
    // calculate the position of the pulse. If this value is 0, the
    // pulse will be at the source. If this value is 1, the pulse will
    // be at the target.
    float t = mod(time, 1.0);

    // Work out the distance from the source and target.
    float distanceFromSource = distance(sourcePosition, vPosition);
    float distanceFromTarget = distance(targetPosition, vPosition);

    // Normalize the rates. Keep them between 0 and 1 but maintain the
    // ratio between the two rates.
    float inRateNormal = inRate / (inRate + outRate);
    float outRateNormal = outRate / (inRate + outRate);
    inRateNormal += 1.0;
    outRateNormal += 1.0;

    // Determine if the pulse should be applied for each direction.
    bool shouldInPulse = inRate > 0.0;
    bool shouldOutPulse = outRate > 0.0;

    // Apply the pulse to the color.
    if (shouldInPulse) {
        color = applyPulse(color, pulseColor, distanceFromTarget, t * inRateNormal);
    }
    if (shouldOutPulse) {
        color = applyPulse(color, pulseColor, distanceFromSource, t * outRateNormal);
    }

    gl_FragColor = vec4(color, 1.0);
    #include <fog_fragment>
}

