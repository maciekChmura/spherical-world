// @flow
import type { Entity } from '../../ecs/Entity';
import { System } from '../../systems/System';
import { World } from '../../ecs';
import Gravity from '../../components/Gravity';
import Velocity from '../../components/Velocity';

const gravitySystemProvider = (ecs: World) => {
  class GravitySystem implements System {
    world: World;
    components: [Entity, Gravity, Velocity][] = ecs.createSelector([Gravity, Velocity]);

    update(delta: number): [Entity, ?Velocity][] {
      const result = [];
      for (const [id,, velocity] of this.components) {
        velocity.linear[1] -= (0.0002 * delta);
        result.push([id, velocity]);
      }

      return result;
    }
  }

  return GravitySystem;
};

export default gravitySystemProvider;