// @flow
import { gl } from '../../engine/glEngine';
import { GlVertexShader, GlFragmentShader, GlShaderProgram } from '../../engine/glShader';
import vertexShaderData from './diffuse.vert';
import fragmentShaderData from './diffuse.frag';

export default class DiffuseProgram extends GlShaderProgram {
  name = 'diffuse';
  vertexShader = new GlVertexShader(vertexShaderData);
  fragmentShader = new GlFragmentShader(fragmentShaderData);

  attributes = ['aVertexPosition', 'aTextureCoord'];
  uniforms = ['uPMatrix', 'uMVMatrix', 'uTexture', 'uLighting'];

  uTexture: WebGLUniformLocation;

  constructor() {
    super();
    this.link();
    this.use();
    gl.uniform1i(this.uTexture, 0);
  }
}
