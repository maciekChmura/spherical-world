// @flow
import { combineReducers } from 'redux';
import { reduceReducers } from '../util/reducerUtils';

import { routerReducer } from '../hud/utils/StateRouter';
import hudReducer from '../hud/hudReducer';
import keyBindingsReducer from '../hud/components/KeyBindings/keyBindingsReducer';

const reducers = {
  hudData: hudReducer,
  keyBindings: keyBindingsReducer,
  uiStates: routerReducer,
};

const combinedReducer = combineReducers(reducers);

const rootReducer = reduceReducers(combinedReducer);

type $ExtractFunctionReturn = <V>(v: (...args: any) => V) => V;
export type State = $ObjMap<typeof reducers, $ExtractFunctionReturn>;

export default rootReducer;
