// import Chunk from './Chunk';
import ThreadProvider from './threadProvider';
// eslint-disable-next-line
import Worker from 'worker-loader!./chunksHandlerThread';

class ChunksHandlerThread extends ThreadProvider {
  constructor(app) {
    super(Worker);
    this.app = app;
    this.gl = app.gl;
    this.terrain = app.terrain;
    this.glTextureLibrary = app.glTextureLibrary;
    this.registerMessageHandler('CHUNK_LOADED', data => {
      const chunk = this.terrain.chunks.get(data.data.geoId);
      chunk.bindVBO(data.data);
    });

    this.registerMessageHandler('CHUNK_LOADED_MINIMAP', data => {
      this.terrain.chunks.get(data.data.geoId).minimap = this.glTextureLibrary.makeChunkMinimap(data.data.minimap);
      this.terrain.generateMinimap();
    });
  }
}

export default ChunksHandlerThread;