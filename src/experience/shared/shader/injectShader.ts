import type { Material, WebGLProgramParametersWithUniforms } from 'three';

/**
 * Inserts code right after an `#include <…>` line of a three.js shader. A missing
 * anchor throws: a three.js update that renames a chunk would otherwise remove
 * the effect without a sound.
 */
export const injectAfter = (source: string, anchor: string, code: string) => {
  if (!source.includes(anchor)) {
    throw new Error(`Shader chunk ${anchor} not found`);
  }
  return source.replace(anchor, `${anchor}\n${code}`);
};

/**
 * Adds one shader effect to a material on top of the ones it already has, so
 * several effects (label, condensation) can share one material. The key keeps
 * three.js from reusing a program built without this effect.
 */
export const extendMaterial = (
  material: Material,
  key: string,
  extend: (shader: WebGLProgramParametersWithUniforms) => void,
) => {
  const previousCompile = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey;
  material.onBeforeCompile = (shader, renderer) => {
    previousCompile.call(material, shader, renderer);
    extend(shader);
  };
  material.customProgramCacheKey = () => `${previousKey.call(material)}|${key}`;
};
