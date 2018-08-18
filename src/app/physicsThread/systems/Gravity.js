// @flow
import type { Entity } from '../../ecs/Entity';
import { System } from '../../systems/System';
import { World } from '../../ecs';
import Gravity from '../../components/Gravity';
import Velocity from '../../components/Velocity';

export default (ecs: World) =>
  class GravitySystem implements System {
    components = ecs.createSelector([Gravity, Velocity]);

    update(delta: number): [Entity, ?Velocity][] {
      const result = [];
      for (const { id, velocity } of this.components) {
        velocity.linear[1] -= (9.81 * delta);
        result.push([id, velocity]);
      }

      return result;
    }
  };
