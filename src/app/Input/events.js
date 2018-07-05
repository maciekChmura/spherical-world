// @flow
// keep constants in integers to be able to use shared memory for input sync in the future
import { MENU_TOGGLED } from '../hud/hudConstants';
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
  PLAYER_RUN,
  PLAYER_STOPED_RUN,
} from '../player/events';

export type INPUT_TYPE = 0 | 1 | 2;
export const INPUT_TYPE_ACTION: 0 = 0;
export const INPUT_TYPE_STATE: 1 = 1;
export const INPUT_TYPE_RANGE: 2 = 2;
// TODO: move events to separate files

export const CAMERA_MOVED_EVENT = {
  type: INPUT_TYPE_RANGE,
  gameEvent: CAMERA_MOVED,
};

export const CAMERA_UNLOCKED_EVENT = {
  type: INPUT_TYPE_ACTION,
  gameEvent: CAMERA_UNLOCKED,
};

export const PLAYER_MOVE_FORWARD_EVENT = {
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: {
    direction: DIRECTION_FORWARD,
  },
};

export const PLAYER_MOVE_BACKWARD_EVENT = {
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: {
    direction: DIRECTION_BACK,
  },
};

export const PLAYER_MOVE_LEFT_EVENT = {
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: {
    direction: DIRECTION_LEFT,
  },
};

export const PLAYER_MOVE_RIGHT_EVENT = {
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_MOVED,
  onEnd: PLAYER_STOPED_MOVE,
  data: {
    direction: DIRECTION_RIGHT,
  },
};

export const PLAYER_JUMP_EVENT = {
  type: INPUT_TYPE_STATE,
  gameEvent: PLAYER_JUMPED,
};

export const PLAYER_RUN_EVENT = {
  type: INPUT_TYPE_STATE,
  onEnd: PLAYER_STOPED_RUN,
  gameEvent: PLAYER_RUN,
};

export const CAMERA_LOCK_EVENT = {
  type: INPUT_TYPE_ACTION,
  gameEvent: CAMERA_LOCKED,
};

export const TOGGLE_MENU_EVENT = {
  type: INPUT_TYPE_ACTION,
  gameEvent: MENU_TOGGLED,
};
