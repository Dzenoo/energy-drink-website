vCondPosition = position;
vCondNormal = normal;
vCondAxisX = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
vCondAxisY = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));
vCondAxisZ = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
vCondClip = gl_Position;
