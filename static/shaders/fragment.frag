#include <fog_pars_fragment>
uniform float time;

uniform vec3 sourcePosition;
uniform vec3 targetPosition;

uniform vec3 sourceColor;
uniform vec3 targetColor;

uniform float colorPercent;

varying vec3 vPosition;

void main() {
    vec3 color = sourceColor;

    // Change time to a value between 0 and 1. This will be used to
    // calculate the position of the pulse.
    float t = mod(time, 1.0);

    // Work out the distance between the source and target.
    float dist = distance(sourcePosition, targetPosition);

    // Work out the distance from the source and target.
    float distanceFromSource = distance(sourcePosition, vPosition);
    float distanceFromTarget = distance(targetPosition, vPosition);

    // How far along the line should the color change.
    float distanceColorPercent = dist * colorPercent;

    // Calculate the pulse color start and end points.
    float pulsePoint = dist * t;

    if (distanceFromSource < pulsePoint - distanceColorPercent) {
        color = sourceColor;
    } else if (distanceFromSource > pulsePoint + distanceColorPercent) {
        color = sourceColor;
    } else {
        color = targetColor;
    }

    gl_FragColor = vec4(color, 1.0);

    #include <fog_fragment>
}
