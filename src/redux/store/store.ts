import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/redux/reducer/combineReducer";

const initialState: any = {};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
  preloadedState: initialState,
});

export default store;
