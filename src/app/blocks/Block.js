// @flow
import identity from '../../../common/fp/identity';

class Block {
  fallSpeedCap = 0;
  fallAcceleration = 0.00002;

  textures = {
    top: 0,
    bottom: 0,
    north: 0,
    south: 0,
    west: 0,
    east: 0,
  };

  buffer = {
    top: 0,
    bottom: 0,
    north: 0,
    south: 0,
    west: 0,
    east: 0,
  };

  getFlags = identity;
}

export default Block;
