// @flow
import Material, { BLENDING_TRANSPARENT } from '../engine/Material/SimpleMaterial';
import TextureLibrary from '../engine/Texture/TextureLibrary';
import type { ShaderLibrary } from '../engine/ShaderLibrary';

export default (textureLibrary: TextureLibrary, shaderLibrary: ShaderLibrary) =>
  new Material({
    name: 'blockSelector',
    diffuse: textureLibrary.get('blockSelector'),
    blendingMode: BLENDING_TRANSPARENT,
    shader: shaderLibrary.get('diffuse'),
  });
