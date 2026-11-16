float floorAway = smoothstep(uFloorFadeStart, uFloorFadeEnd, length(vFloorWorld.xz));
gl_FragColor.rgb = mix(gl_FragColor.rgb, uFloorFar, floorAway);
