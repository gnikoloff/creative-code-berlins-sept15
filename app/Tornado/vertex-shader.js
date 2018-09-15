export const vertexShader = `
    uniform float time;

    attribute float offsetTime;

    void main () {
        float curTime = mod(time + offsetTime, 3.0);
        float rate = curTime / 1.0;

        vec3 targetPosition = position + vec3(0.0, 80.0, 0.0);

        vec3 updatePosition = position;

        updatePosition.y = mix(updatePosition.y, targetPosition.y, clamp(curTime, 0.0, 1.0));

        updatePosition.x = sin(time * 2.0 + offsetTime) * (updatePosition.y + offsetTime + offsetTime);
        updatePosition.z = cos(time * 2.0 + offsetTime) * (updatePosition.y + offsetTime + offsetTime);

        gl_Position = 
            projectionMatrix * 
            modelViewMatrix * 
            vec4(updatePosition, 1.0);
            
        gl_PointSize = updatePosition.y * 0.2;
    }
`