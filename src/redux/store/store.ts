import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/redux/reducer/combineReducer";
import { initSSEBatchProcessor } from '@/redux/store/middleware/SSEMiddleware';

const initialState: any = {};

export const createStore = () => {
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

  // 初始化 SSE Batch Processor
  initSSEBatchProcessor(store);
  
  return store;
};

const store = createStore();
export default store;
