// @flow
import { vec3, quat } from 'gl-matrix';
import GameEventQueue from '../../GameEvent/GameEventQueue';
import {
  playerMovedObservable,
  playerStopedMoveObservable,
  PLAYER_MOVED,
  PLAYER_STOPED_MOVE,
  DIRECTION_FORWARD,
  DIRECTION_BACK,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
} from '../../player/events';
import { System } from '../../systems/System';
import { World } from '../../ecs';
import Transform from '../../components/Transform';
import Velocity from '../../components/Velocity';
import UserControlled from '../../components/UserControlled';

const getAngle = (x: number, z: number): number => do {
  if (x === 0) {
    if (z > 0) -90;
    else if (z < 0) 90;
  } else if (x > 0) {
    if (z > 0) -45;
    else if (z < 0) 45;
  } else if (x < 0) {
    if (z > 0) -135;
    else if (z < 0) 135;
    else 180;
  }
} | 0;

export default (ecs: World) => {
  class UserControlSystem implements System {
    world: World;
    components: [string, Transform, Velocity, UserControlled][] = ecs.createSelector([Transform, Velocity, UserControlled]);
    userActions: GameEventQueue = new GameEventQueue(playerMovedObservable);

    update(delta: number): Array {
      const result = [];
      const [[id, transform, velocity, userControls]] = this.components;

      this.userActions.events.reduce((userControls, { type, data }) => {
        const { direction } = data;
        if (type === PLAYER_MOVED) {
          switch (direction) {
            case DIRECTION_FORWARD: userControls.movingForward = true;
              break;
            case DIRECTION_BACK: userControls.movingBackward = true;
              break;
            case DIRECTION_LEFT: userControls.movingLeft = true;
              break;
            case DIRECTION_RIGHT: userControls.movingRight = true;
              break;
            default:
          }
        }
        if (type === PLAYER_STOPED_MOVE) {
          switch (direction) {
            case DIRECTION_FORWARD: userControls.movingForward = false;
              break;
            case DIRECTION_BACK: userControls.movingBackward = false;
              break;
            case DIRECTION_LEFT: userControls.movingLeft = false;
              break;
            case DIRECTION_RIGHT: userControls.movingRight = false;
              break;
            default:
          }
        }
        return userControls;
      }, userControls);

      const movingX = userControls.movingForward - userControls.movingBackward;
      const movingZ = userControls.movingLeft - userControls.movingRight;

      // // 1.570796327rad == 90*
      // let deltaX = -delta * this.speed * (this.running + 1) * (Math.sin(this.horizontalRotate) * movingX + (Math.sin(this.horizontalRotate + 1.570796327)) * movingZ);
      // let deltaZ = -delta * this.speed * (this.running + 1) * (Math.cos(this.horizontalRotate) * movingX + (Math.cos(this.horizontalRotate + 1.570796327)) * movingZ);
      //

      // console.log(this.userActions)
      // vec3.scaleAndAdd(velocity.linear, velocity.linear, transform.rotation, delta*0.01);
      // vec3.transformQuat(velocity.linear, velocity.linear, quat.rotateX(quat.create(), quat.create(), transform.rotation.x));
      // console.log( quat.rotateX(quat.create(), quat.create(), transform.rotation.x))

      const angle = getAngle(movingX, movingZ);
      const rotation = quat.rotateY(quat.create(), transform.rotation, angle * Math.PI / 180 );

      if (userControls.movingForward || userControls.movingBackward || userControls.movingLeft || userControls.movingRight) {
        const v = vec3.fromValues(1, 0, 0);
        vec3.transformQuat(v, v, rotation);

        const v2 = vec3.fromValues(0, 1, 0);
        vec3.transformQuat(v2, v2, rotation);
        // console.log(v)

        const v3 = vec3.fromValues(0, 0, 1);
        vec3.transformQuat(v3, v3, rotation);

        // console.log(v)
        // this.vector = [-v2[2], -v[2], -v3[2]];
        vec3.add(velocity.linear, velocity.linear, [-v[2], -v2[2], -v3[2]]);

        vec3.scale(velocity.linear, velocity.linear, 0.01);
        // console.log(transform.translation)
        result.push([id, velocity]);
      } else {
        vec3.set(velocity.linear, 0, 0, 0);
      }

      this.userActions.clear();
      return [[id, userControls]];
    }
  }

  return UserControlSystem;
};