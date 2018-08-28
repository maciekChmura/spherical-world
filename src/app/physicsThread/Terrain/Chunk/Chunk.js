// @flow
import { getIndex } from '../../../../../common/chunk';
import ChunkWithData from '../../../Terrain/Chunk/ChunkWithData';
import {
  blocksFlags,
  blocksInfo,
} from '../../../blocks/blockInfo';

import {
  CHUNK_STATUS_NEED_LOAD_VBO,
} from '../../../Terrain/Chunk/chunkConstants';

export default class Chunk extends ChunkWithData<Chunk> {
  flags: Uint8Array;

  constructor(x: number, z: number) {
    super(x, z);

    this.rainfallData = new Uint8Array(256);
    this.temperatureData = new Uint8Array(256);
    this.blocksFlags = blocksFlags;

    this.light = new Uint16Array(this.height * 16 * 16);
  }

  setBlock(x, y, z, value) {
    this.blocks[x + z * 16 + y * 256] = value;
    this.state = CHUNK_STATUS_NEED_LOAD_VBO;
  }

  putBlock(x: number, y: number, z: number, value: number, plane: number) {
    let placed = true;
    if (blocksInfo[value]) {
      placed = blocksInfo[value].putBlock(this, x, y, z, value, plane);
    } else {
      this.blocks[x + z * 16 + y * 256] = value;
    }
    if (placed) {
      this.state = CHUNK_STATUS_NEED_LOAD_VBO;
    }
  }

  removeBlock(x: number, y: number, z: number): void {
    const index = getIndex(x, y, z);
    this.blocks[index] = 0;
    this.state = CHUNK_STATUS_NEED_LOAD_VBO;
  }
}
