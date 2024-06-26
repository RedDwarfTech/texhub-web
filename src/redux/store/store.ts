import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/redux/reducer/combineReducer';
import thunk from 'redux-thunk';

const initialState = {};

const store = configureStore({
    reducer: rootReducer,
    middleware: [thunk],
    devTools: process.env.NODE_ENV !== 'production',
    preloadedState: initialState
});

export default store;