// @flow
import type { ChunkState } from './chunkConstants';
import { BLOCKS_IN_CHUNK } from '../../../common/constants/chunk';
import { CHUNK_STATUS_NEED_LOAD_ALL, CHUNK_STATUS_NEED_LOAD_VBO } from './chunkConstants';
import { getGeoId, getIndex } from '../../../common/chunk';
// north direction - decreasing of X

class ChunkBase<TChunk> {
  x: number;
  z: number;
  height: number;
  geoId: string;
  westChunk: TChunk = this;
  eastChunk: TChunk = this;
  southChunk: TChunk = this;
  northChunk: TChunk = this;
  state: ChunkState = CHUNK_STATUS_NEED_LOAD_ALL;
  nestedChunks: TChunk[] = [];
  hasNestedChunks: boolean = false;
  surroundingChunks: TChunk[] = [];
  hasSurroundingChunks: boolean = false;
  blocks: Uint8Array;
  light: Uint16Array = new Uint16Array(BLOCKS_IN_CHUNK);
  flags: Uint8Array;

  static BUFFERS_COUNT: number = 3;

  constructor(blocksData: ArrayBuffer, x: number, z: number) {
    this.x = x;
    this.z = z;
    this.geoId = getGeoId(x, z);
    this.blocks = new Uint8Array(blocksData, 0, BLOCKS_IN_CHUNK);
    this.flags = new Uint8Array(blocksData, BLOCKS_IN_CHUNK);
  }

  getBlock(x: number, y: number, z: number) {
    return this.blocks[getIndex(x, y, z)];
  }

  setBlock(x: number, y: number, z: number, value: number) {
    this.blocks[getIndex(x, y, z)] = value;
    this.state = CHUNK_STATUS_NEED_LOAD_VBO;
  }

  checkNestedChunks() {
    this.nestedChunks = [
      this.northChunk,
      this.westChunk,
      this.southChunk,
      this.eastChunk,
    ].filter(chunk => chunk !== this);
    this.hasNestedChunks = this.nestedChunks.length === 4;
    this.surroundingChunks = [
      this.northChunk.eastChunk,
      this.northChunk.westChunk,
      this.southChunk.eastChunk,
      this.southChunk.westChunk,
    ].filter(chunk => chunk !== this).concat(this.nestedChunks);
    this.hasSurroundingChunks = this.surroundingChunks.length === 8;
  }

  setNorthChunk(chunk: TChunk) {
    this.northChunk = chunk;
    this.checkNestedChunks();
  }

  setSouthChunk(chunk: TChunk) {
    this.southChunk = chunk;
    this.checkNestedChunks();
  }

  setWestChunk(chunk: TChunk) {
    this.westChunk = chunk;
    this.checkNestedChunks();
  }

  setEastChunk(chunk: TChunk) {
    this.eastChunk = chunk;
    this.checkNestedChunks();
  }
}

export const COLUMN: 1 = 1;
export const ROW: 16 = 16;
export const SLICE: 256 = 256;

export const COLUMN_NESTED_CHUNK: 15 = 15;
export const ROW_NESTED_CHUNK: 240 = 240;

export default ChunkBase;
