// @flow
import {
  INPUT_TYPE_RANGE,
  INPUT_TYPE_ACTION,
  INPUT_TYPE_STATE,
  CATEGORY_MOVEMENT,
  CATEGORY_INTERFACE,
  CATEGORY_COMBAT_AND_BLOCKS,
} from './eventTypes';
import RangeInputEvent from './RangeInputEvent';
import { MENU_TOGGLED, INVENTORY_TOGGLED } from '../hud/hudConstants';
import {
  CAMERA_MOVED,
  CAMERA_LOCKED,
  CAMERA_UNLOCKED,
  PLAYER_MOVED,
  PLAYER_STOPED_MOVE,
  DIRECTION_FORWARD,
  DIRECTION_BACK,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  PLAYER_JUMPED,
  PLAYER_STOPED_JUMP,
  PLAYER_RUN,
  PLAYER_STOPED_RUN,
  PLAYER_ATTACKED,
  PLAYER_STOPED_ATTACK,
  PLAYER_START_PUT_BLOCK,
} from '../player/events';

// TODO: move events to separate files

export const CAMERA_MOVED_EVENT = {
  type: INPUT_TYPE_RANGE,
  gameEvent: CAMERA_MOVED,
  data: ({ x, y, z }: RangeInputEvent) => ({
    x, y, z,
  }),
};

export const CAMERA_UNLOCKED_EVENT = {
  type: INPUT_TYPE_ACTION,
  gameEvent: CAMERA_UNLOCKED,
};

export const PLAYER_MOVE_FORWARD_EVENT = {
  category: CATEGORY_MOVEMENT,
  caption: 'Move Forward',
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: () => ({
    direction: DIRECTION_FORWARD,
  }),
};

export const PLAYER_MOVE_BACKWARD_EVENT = {
  category: CATEGORY_MOVEMENT,
  caption: 'Move Backward',
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: () => ({
    direction: DIRECTION_BACK,
  }),
};

export const PLAYER_MOVE_LEFT_EVENT = {
  category: CATEGORY_MOVEMENT,
  caption: 'Strafe Left',
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: () => ({
    direction: DIRECTION_LEFT,
  }),
};

export const PLAYER_MOVE_RIGHT_EVENT = {
  category: CATEGORY_MOVEMENT,
  caption: 'Strafe Right',
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: () => ({
    direction: DIRECTION_RIGHT,
  }),
};

export const PLAYER_JUMP_EVENT = {
  category: CATEGORY_MOVEMENT,
  caption: 'Jump',
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_JUMPED,
  onEnd: PLAYER_STOPED_JUMP,
};

export const PLAYER_RUN_EVENT = {
  category: CATEGORY_MOVEMENT,
  caption: 'Run',
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_RUN,
  onEnd: PLAYER_STOPED_RUN,
};

export const CAMERA_LOCK_EVENT = {
  type: INPUT_TYPE_ACTION,
  gameEvent: CAMERA_LOCKED,
};

export const TOGGLE_MENU_EVENT = {
  category: CATEGORY_INTERFACE,
  caption: 'Main menu',
  type: INPUT_TYPE_ACTION,
  gameEvent: MENU_TOGGLED,
};

export const TOGGLE_INVENTORY_EVENT = {
  category: CATEGORY_INTERFACE,
  caption: 'Inventory',
  type: INPUT_TYPE_ACTION,
  gameEvent: INVENTORY_TOGGLED,
};

export const PLAYER_ATTACK_EVENT = {
  category: CATEGORY_COMBAT_AND_BLOCKS,
  caption: 'Attack / Destroy block',
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_ATTACKED,
  onEnd: PLAYER_STOPED_ATTACK,
};

export const PLAYER_PUT_BLOCK_EVENT = {
  category: CATEGORY_COMBAT_AND_BLOCKS,
  caption: 'Put Block',
  type: INPUT_TYPE_ACTION,
  gameEvent: PLAYER_START_PUT_BLOCK,
};
