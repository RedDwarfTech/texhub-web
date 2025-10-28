import { SSEBatchProcessor } from '@/component/common/cache/SSEBatchProcessor.js';

let batchProcessor: SSEBatchProcessor;

export const initSSEBatchProcessor = (store: any) => {
  batchProcessor = new SSEBatchProcessor((action) => {
    store.dispatch(action);
  });
  
  return batchProcessor;
};

export const getSSEBatchProcessor = () => batchProcessor;