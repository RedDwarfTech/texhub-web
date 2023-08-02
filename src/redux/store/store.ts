import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/redux/reducer/combineReducer';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

const logger = createLogger(); 
const initialState = {};

const store = configureStore({
    reducer: rootReducer,
    middleware: [logger, thunk],
    devTools: process.env.NODE_ENV !== 'production',
    preloadedState: initialState
});

export default store;