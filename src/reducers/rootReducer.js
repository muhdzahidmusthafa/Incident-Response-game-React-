import { combineReducers } from 'redux';

import gameLogReducer from './gameLogReducer.js';
import variablesReducer from './variablesReducer.js';
import textReducer from './textReducer.js';
import dataReducer from './dataReducer.js';

const rootReducer = combineReducers({
  game: gameLogReducer,
  variables: variablesReducer,
  text: textReducer,
  data: dataReducer
});

export default rootReducer;