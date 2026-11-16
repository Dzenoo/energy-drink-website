vec4 berry = berrySurface(
  vBerryObject,
  length(vBerryObject.xz - uBerryAxis),
  berryRadius(vBerryObject.y)
);
diffuseColor.rgb = berry.rgb;
