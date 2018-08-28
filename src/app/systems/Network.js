// @flow
import type World from '../ecs/World';
import type Network from '../network';
import { PLAYER_CHANGE_POSITION } from '../player/playerConstants';
import { System } from './System';
import { Transform, Camera } from '../components';

export default (ecs: World, network: Network) =>
  class NetworkSystem implements System {
    player = ecs.createSelector([Transform, Camera]);
    events = ecs.events
      .filter(el => el.network === true)
      .subscribeQueue();

    networkEvents = network.events
      .subscribe(({ type, payload: { data } }) => {
        ecs.dispatch({ type, payload: data });
      });

    lastUpdate = Date.now();
    update(delta: number): void {
      if (Date.now() > this.lastUpdate + 100) { // TODO: replace Date.now() by global engine tick time
        this.lastUpdate = Date.now();
        const [{ id, transform }] = this.player;
        network.emit(PLAYER_CHANGE_POSITION, {
          x: transform.translation[0],
          y: transform.translation[1],
          z: transform.translation[2],
          id,
        });
      }
      for (const event of this.events.events) {
        network.emit(event.type, event.payload);
      }
      this.events.clear();
    }
  };
