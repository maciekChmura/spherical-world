// @flow
import type Network from './network';
import { initWebGL } from './engine/glEngine';
import { createBillboard } from './engine/Model';
import HUD from './hud/HudApi';
import { World } from '../common/ecs';

let tex = 0;
setInterval(() => {
  tex += 1;
  if (tex === 16) {
    tex = 0;
  }
}, 100);

const engineProvider = (
  store,
  network: Network,
  Player,
  resourceLoader,
  ecs: World,
  Skybox,
) => {
  class Engine {
    ecs: World = ecs;
    lastTime: number = 0;

    constructor() {
      this.init().catch(console.error);
    }

    async init() {
      await network.connect();
      initWebGL();

      Player.hudBillboardModel = createBillboard(2.0);

      const player = await network.request('LOGIN', { cookie: 12345 });

      this.player = Player(player, true);

      this.hud = new HUD(store);

      await resourceLoader.loadAddons();
      this.skyBox = Skybox(this.player);
      await network.start();
      requestAnimationFrame(this.gameCycle);
    }

    gameCycle = (time: number): void => {
      const delta = time - this.lastTime;
      this.lastTime = time;
      this.ecs.update(delta);
      requestAnimationFrame(this.gameCycle);
    }

    static initKeyboardActions() {
      // this.keyboard.registerAction({
      //   name: 'showDebugInfo',
      //   onKeyDown() {
      //     this.hud.showDebugInfo();
      //   },
      // });
      // this.keyboard.registerAction({
      //   name: 'enterFullscreen',
      //   onKeyUp() {
      //     if (document.body.requestFullscreen) {
      //       document.body.requestFullscreen();
      //     } else if (document.body.mozRequestFullScreen) {
      //       document.body.mozRequestFullScreen();
      //     } else if (document.body.webkitRequestFullscreen) {
      //       document.body.webkitRequestFullscreen();
      //     }
      //   },
      // });
    }

    static drawGL() {
      // gl.disable(gl.BLEND);
      // this.useShader('chunk');
      //
      //
      // // gl.uniform3fv(this.shaders.get('chunk').uAnimTextures, [127.0, 0, tex / 16]);
      //
      // // this.terrain.draw();
      //
      // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // this.useShader('diffuse');
      //
      // for (const i in Player.instances) {
      //   if (Player.instances[i] !== this.player) {
      //     this.mvPushMatrix();
      //     Player.instances[i].draw();
      //     this.mvPopMatrix();
      //   }
      // }
      //
      // this.useShader('billboard');
      //
      // for (const i in Player.instances) {
      //   if (Player.instances[i] !== this.player) {
      //     this.mvPushMatrix();
      //     Player.instances[i].drawHud();
      //     this.mvPopMatrix();
      //   }
      // }
    }
  }
  return Engine;
};


export default engineProvider;
