// @flow
import type { BlockFace } from '../../../../common/block';
import { getIndex } from '../../../../common/chunk';
import { BLOCKS_IN_CHUNK, CHUNK_HEIGHT } from '../../../../common/constants/chunk';
import {
  blocksTextureInfo,
  blocksFlags,
  bufferInfo,
  blocksInfo,
  LIGHT_TRANSPARENT,
} from '../../../blocks/blockInfo';
import ChunkBase, { SLICE } from '../../../Terrain/Chunk/ChunkBase';

import {
  CHUNK_STATUS_LOADED,
  CHUNK_STATUS_NEED_LOAD_ALL,
  CHUNK_STATUS_NEED_LOAD_LIGHT,
  CHUNK_STATUS_NEED_LOAD_VBO,
  CHUNK_VBO_LOADED,
} from '../../../Terrain/Chunk/chunkConstants';
import {
  calcRecursionRed,
  calcRecursionGreen,
  calcRecursionBlue,
  calcRecursionGlobal,
  calcRecursionRedRemove,
  calcRecursionGreenRemove,
  calcRecursionBlueRemove,
  calcRecursionGlobalRemove,
} from './chunkLigting';

type ChunkBuffers = {|
  +vertexBuffer: number[],
  +indexBuffer: number[],
  vertexCount: number,
|}

const createBuffers = (): ChunkBuffers => ({
  vertexBuffer: [],
  indexBuffer: [],
  vertexCount: 0,
});

const getColorComponent = (light, c, cf, s1, s1f, s2, s2f, count, halfCount, shift) =>
  0.8 ** (halfCount - (((
    (light >>> shift) & 0xF)
    + (s1f ? ((s1 >>> shift) & 0xF) : 0)
    + (s2f ? ((s2 >>> shift) & 0xF) : 0)
    + (cf ? ((c >>> shift) & 0xF) : 0)
  ) / count));

const getLightColor = (light, c, cf, s1, s1f, s2, s2f) => {
  const count = 1 + s1f + s2f + cf;
  const halfCount = 17 - (count / 2);
  return [
    getColorComponent(light, c, cf, s1, s1f, s2, s2f, count, halfCount, 12),
    getColorComponent(light, c, cf, s1, s1f, s2, s2f, count, halfCount, 8),
    getColorComponent(light, c, cf, s1, s1f, s2, s2f, count, halfCount, 4),
    getColorComponent(light, c, cf, s1, s1f, s2, s2f, count, halfCount, 0),
  ];
};

const getChunkNear = (j: number, k: number, chunk) => {
  let chunkNear = chunk;
  if (j === -1) {
    j = 15;
    chunkNear = chunkNear.northChunk;
  } else if (j === 16) {
    j = 0;
    chunkNear = chunkNear.southChunk;
  }
  if (k === -1) {
    k = 15;
    chunkNear = chunkNear.westChunk;
  } else if (k === 16) {
    k = 0;
    chunkNear = chunkNear.eastChunk;
  }
  return { j, k, chunkNear };
};

const getLight = (i: number, j: number, k: number, chunk) => {
  let chunkNear;
  ({ j, k, chunkNear } = getChunkNear(j, k, chunk));
  const index = getIndex(j, i, k);
  if (blocksFlags[chunkNear.blocks[index]][LIGHT_TRANSPARENT] || blocksFlags[chunkNear.blocks[index]][4]) {
    return [1, chunkNear.light[index]];
  }
  return [0, -1];
};

const addDefaultVertex = (i, j, k, u, v) => ([
  j + (i ? v : k ? u : (j < 0 ? 1 : 0)),
  ((j || k) ? v : (i < 0 ? 1 : 0)),
  k + ((i || j) ? u : (k < 0 ? 1 : 0)),
]);

const addPlane = (i: number, j: number, k: number): number[][] => [
  addDefaultVertex(i, j, k, 0, 0),
  addDefaultVertex(i, j, k, 0, 1),
  addDefaultVertex(i, j, k, 1, 0),
  addDefaultVertex(i, j, k, 1, 1),
];

const basePlanes = [
  addPlane(-1, 0, 0),
  addPlane(1, 0, 0),
  addPlane(0, -1, 0),
  addPlane(0, 1, 0),
  addPlane(0, 0, -1),
  addPlane(0, 0, 1),
];

const addVertex = (u, v) => (i, j, k, ii, jj, kk, light, color, chunk) => {
  let c = 0;
  let cf = 0;
  let s1f = 0;
  let s1 = 0;
  let s2f = 0;
  let s2 = 0;
  if (ii) {
    [s2f, s2] = getLight(i, j, k + u, chunk);
    [s1f, s1] = getLight(i, j + v, k, chunk);
    j += v;
    k += u;
  } else if (jj) {
    [s2f, s2] = getLight(i, j, k + u, chunk);
    [s1f, s1] = getLight(i + v, j, k, chunk);
    i += v;
    k += u;
  } else if (kk) {
    [s2f, s2] = getLight(i, j + u, k, chunk);
    [s1f, s1] = getLight(i + v, j, k, chunk);
    i += v;
    j += u;
  }

  if (s1 !== -1 || s2 !== -1) {
    [cf, c] = getLight(i, j, k, chunk);
  }
  const [
    r, g, b, vGlobal,
  ] = getLightColor(light, c, cf, s1, s1f, s2, s2f);

  return [r, g, b, vGlobal * color];
};

const addVertexTL = addVertex(-1, -1);
const addVertexTR = addVertex(-1, 1);
const addVertexBL = addVertex(1, -1);
const addVertexBR = addVertex(1, 1);

const createPlane = (chunk, planes, ii, jj, kk, planeIndex, color) => (block, i, j, k, buffers) => {
  const { j: jNear, k: kNear, chunkNear } = getChunkNear(j + jj, k + kk, chunk);
  const indexNear = getIndex(jNear, i + ii, kNear);
  const blockNear = chunkNear.blocks[indexNear];

  if (!(blocksFlags[blockNear][1]) || (blocksFlags[block][4] && (block === blockNear))) {
    return;
  }
  const buffer = buffers[bufferInfo[block][planeIndex]];
  const light = chunkNear.light[indexNear];
  const iVertex = i + ii;
  const jVertex = j + jj;
  const kVertex = k + kk;
  const plane = planes[planeIndex];
  const textureU = blocksTextureInfo[block][planeIndex] / 16;
  const textureV = Math.floor(textureU) / 16;

  buffer.vertexBuffer.push(
    plane[0] + j,
    plane[1] + i,
    plane[2] + k,
    textureU, textureV,
    block,
    ...addVertexTL(iVertex, jVertex, kVertex, ii, jj, kk, light, color, chunk),

    plane[3] + j,
    plane[4] + i,
    plane[5] + k,
    textureU, textureV + (1 / 16),
    block,
    ...addVertexTR(iVertex, jVertex, kVertex, ii, jj, kk, light, color, chunk),

    plane[6] + j,
    plane[7] + i,
    plane[8] + k,
    textureU + (1 / 16), textureV,
    block,
    ...addVertexBL(iVertex, jVertex, kVertex, ii, jj, kk, light, color, chunk),

    plane[9] + j,
    plane[10] + i,
    plane[11] + k,
    textureU + (1 / 16), textureV + (1 / 16),
    block,
    ...addVertexBR(iVertex, jVertex, kVertex, ii, jj, kk, light, color, chunk),
  );

  // TODO: create one index buffer per all chunks
  const b = [
    buffer.vertexCount,
    buffer.vertexCount + 1,
    buffer.vertexCount + 3,
    buffer.vertexCount,
    buffer.vertexCount + 3,
    buffer.vertexCount + 2,
  ];
  buffer.indexBuffer.push(...(ii < 0 || jj > 0 || kk < 0)
    ? b
    : b.reverse());
  buffer.vertexCount += 4;
};

type CreatePlane = $Call<typeof createPlane, Chunk, number[][], number, number, number, number, number>;

export default class Chunk extends ChunkBase<Chunk> {
  minimap: Uint8Array = new Uint8Array(256 * 3);

  createTopPlane: CreatePlane;
  createBottomPlane: CreatePlane;
  createNorthPlane: CreatePlane;
  createSouthPlane: CreatePlane;
  createWestPlane: CreatePlane;
  createEastPlane: CreatePlane;

  constructor(binaryData: ArrayBuffer, x: number, z: number) {
    super(binaryData, x, z);

    this.terrainMipMap = null;

    this.rainfallData = new Uint8Array(256);
    this.temperatureData = new Uint8Array(256);

    const planes = basePlanes.map(plane => [].concat(...plane.map(([x, y, z]) => [
      x + this.x,
      y,
      z + this.z,
    ])));
    this.createTopPlane = createPlane(this, planes, 1, 0, 0, 0, 1);
    this.createBottomPlane = createPlane(this, planes, -1, 0, 0, 1, 0.5);
    this.createNorthPlane = createPlane(this, planes, 0, -1, 0, 2, 0.6);
    this.createSouthPlane = createPlane(this, planes, 0, 1, 0, 3, 0.6);
    this.createWestPlane = createPlane(this, planes, 0, 0, -1, 4, 0.8);
    this.createEastPlane = createPlane(this, planes, 0, 0, 1, 5, 0.8);
  }

  calcRecursionRed(x: number, y: number, z: number) {
    calcRecursionRed(this, x, y, z, 400);
  }

  calcRecursionGreen(x: number, y: number, z: number) {
    calcRecursionGreen(this, x, y, z, 400);
  }

  calcRecursionBlue(x: number, y: number, z: number) {
    calcRecursionBlue(this, x, y, z, 400);
  }

  calcGlobalRecursion(x: number, y: number, z: number) {
    calcRecursionGlobal(this, x, y, z, 400);
  }

  calcRecursionRedRemove(x: number, y: number, z: number) {
    calcRecursionRedRemove(this, x, y, z, 400);
  }

  calcRecursionGreenRemove(x: number, y: number, z: number) {
    calcRecursionGreenRemove(this, x, y, z, 400);
  }

  calcRecursionBlueRemove(x: number, y: number, z: number) {
    calcRecursionBlueRemove(this, x, y, z, 400);
  }

  calcGlobalRecursionRemove(x: number, y: number, z: number) {
    calcRecursionGlobalRemove(this, x, y, z, 400);
  }

  calcVBO() {
    const buffers = [createBuffers(), createBuffers(), createBuffers()];

    for (let index = SLICE; index < BLOCKS_IN_CHUNK; index += 1) {
      const i = index >>> 8;
      const j = index & 0xF;
      const k = (index >>> 4) & 0xF;
      const block = this.blocks[index];
      if (block) {
        if (typeof blocksInfo[block].renderToChunk === 'function') { // TODO: MODEL
          buffers[bufferInfo[block][0]].vertexCount += blocksInfo[block].renderToChunk(this, j, i, k, buffers[bufferInfo[block][0]], buffers);
        } else {
          this.createTopPlane(block, i, j, k, buffers);
          this.createBottomPlane(block, i, j, k, buffers);
          this.createNorthPlane(block, i, j, k, buffers);
          this.createSouthPlane(block, i, j, k, buffers);
          this.createWestPlane(block, i, j, k, buffers);
          this.createEastPlane(block, i, j, k, buffers);
        }
      }
    }

    const buffersInfo = [{
      indexCount: 0,
      index: 0,
      offset: 0,
    }, {
      indexCount: 0,
      index: 1,
      offset: 0,
    }, {
      indexCount: 0,
      index: 2,
      offset: 0,
    }];
    let offset = 0;
    for (let i = 0; i < buffers.length; i += 1) {
      buffersInfo[i].indexCount = buffers[i].indexBuffer.length;
    }
    for (let i = 1; i < buffers.length; i += 1) {
      offset += buffers[i - 1].vertexCount;
      for (let j = 0; j < buffers[i].indexBuffer.length; j += 1) {
        buffers[i].indexBuffer[j] += offset;
      }
      buffersInfo[i].offset = buffersInfo[i - 1].offset + (buffersInfo[i - 1].indexCount * 2);
    }
    const buffersData = buffers.reduce((prev, curr) => ({
      vertexBuffer: prev.vertexBuffer.concat(curr.vertexBuffer),
      indexBuffer: prev.indexBuffer.concat(curr.indexBuffer),
    }), createBuffers());
    buffersData.vertexBuffer = new Float32Array(buffersData.vertexBuffer).buffer;
    buffersData.indexBuffer = new Uint16Array(buffersData.indexBuffer).buffer;
    self.postMessage({
      type: 'UPDATE_COMPONENTS',
      payload: {
        events: [{
          type: CHUNK_VBO_LOADED,
          payload: {
            geoId: this.geoId,
            buffers: buffersData,
            buffersInfo,
          },
        }],
      },
    }, Object.values(buffersData));
  }

  prepareLight() {
    for (let x = 0; x < 16; x += 1) {
      for (let z = 0; z < 16; z += 1) {
        let y = CHUNK_HEIGHT - 1;
        let lightLevel = 15;
        while (y > 0) {
          const index = getIndex(x, y, z);
          if (!blocksFlags[this.blocks[index]][1]) {
            lightLevel = 0;
          } else if (!blocksFlags[this.blocks[index]][0]) {
            lightLevel -= 1;
          }
          if (!lightLevel) {
            break;
          }
          this.light[index] = lightLevel;
          y -= 1;
        }
        const index = getIndex(x, y, z);

        // this.minimap[(x + z * 16) * 3] = this.terrainMipMap[blocksTextureInfo[this.blocks[index]][0]][0];
        // this.minimap[(x + z * 16) * 3 + 1] = this.terrainMipMap[blocksTextureInfo[this.blocks[index]][0]][1];
        // this.minimap[(x + z * 16) * 3 + 2] = this.terrainMipMap[blocksTextureInfo[this.blocks[index]][0]][2];
      }
    }
    postMessage({ type: 'CHUNK_LOADED_MINIMAP', data: { geoId: this.geoId, minimap: this.minimap } });
  }

  calcGlobalLight() {
    for (let x = 0; x < 16; x += 1) {
      for (let z = 0; z < 16; z += 1) {
        let y = CHUNK_HEIGHT - 1;
        while ((y > 0) && (blocksFlags[this.blocks[getIndex(x, y, z)]][1])) {
          y -= 1;
          this.calcGlobalRecursion(x, y + 1, z);
        }
      }
    }
    for (let x = 0; x < 16; x += 1) {
      for (let z = 0; z < 16; z += 1) {
        let y = CHUNK_HEIGHT - 1;
        while (y > 0) {
          const index = getIndex(x, y, z);
          if (this.blocks[index] === 128) {
            this.light[index] = (this.light[index] & 0x000F) | 0xFD20;
            this.calcRecursionRed(x, y, z);
            this.calcRecursionGreen(x, y, z);
            this.calcRecursionBlue(x, y, z);
          }

          y -= 1;
        }
      }
    }
  }

  putBlock(x: number, y: number, z: number, value: number, face: BlockFace) {
    let placed = true;
    if (blocksInfo[value]) {
      placed = blocksInfo[value].putBlock(this, x, y, z, value, face);
    } else {
      this.blocks[getIndex(x, y, z)] = value;
    }
    if (placed) {
      if (!blocksFlags[this.blocks[getIndex(x, y, z)]][0]) {
        while ((y > -1) && (!this.blocks[getIndex(x, y, z)])) {
          this.calcGlobalRecursionRemove(x, y, z);
          y -= 1;
        }
      }
      this.state = CHUNK_STATUS_NEED_LOAD_VBO;
    }
  }

  removeBlock(x: number, y: number, z: number) {
    const index = getIndex(x, y, z);
    const block = this.blocks[index];
    this.blocks[index] = 0;
    const ytmp = y;
    if ((this.light[index + SLICE] & 0xF) === 15) {
      const ytmp2 = y;
      while ((y > -1) && (!this.blocks[index])) {
        this.light[index] = (this.light[index] & 0xFFF0) | 0x000F;
        y -= 1;
      }
      y = ytmp2;
      while ((y > -1) && (!this.blocks[index])) {
        this.calcGlobalRecursion(x, y, z);
        y -= 1;
      }
    } else {
      // TODO - copy from addblock
      this.calcGlobalRecursion(x, y, z);
    }
    y = ytmp;
    if (blocksFlags[block][0]) {
      this.calcRecursionRedRemove(x, y, z);
      this.calcRecursionGreenRemove(x, y, z);
      this.calcRecursionBlueRemove(x, y, z);
    } else {
      this.calcRecursionRed(x, y, z);
      this.calcRecursionGreen(x, y, z);
      this.calcRecursionBlue(x, y, z);
    }
    this.state = CHUNK_STATUS_NEED_LOAD_VBO;
  }

  updateState() {
    const updateState = chunk => (chunk.state !== CHUNK_STATUS_NEED_LOAD_ALL
      ? chunk.updateState()
      : null);
    if (this.state === CHUNK_STATUS_NEED_LOAD_ALL) {
      this.state = CHUNK_STATUS_NEED_LOAD_LIGHT;
      this.surroundingChunks.forEach(updateState);
      this.updateState();
    } else if (this.state === CHUNK_STATUS_NEED_LOAD_LIGHT) {
      if (this.hasSurroundingChunks
        && this.surroundingChunks.every(chunk => chunk.state !== CHUNK_STATUS_NEED_LOAD_ALL)
      ) {
        this.state = CHUNK_STATUS_NEED_LOAD_VBO;
        this.calcGlobalLight();
        this.nestedChunks.forEach(updateState);
        this.updateState();
      }
    } else if (this.state === CHUNK_STATUS_NEED_LOAD_VBO) {
      if (this.hasNestedChunks
        && this.nestedChunks.every(chunk => chunk.state >= CHUNK_STATUS_NEED_LOAD_VBO)
      ) {
        this.calcVBO();
        this.state = CHUNK_STATUS_LOADED;
        this.nestedChunks.forEach(updateState);
      }
    }
  }
}
