import { updateLogText } from "@/service/project/ProjectService";
import { SSEMessage } from "rdjs-wheel";

export class SSEBatchProcessor {
  private messageQueue: SSEMessage[] = [];
  private isProcessing = false;
  private batchTimer: number | null = null;

  // 配置参数
  private readonly BATCH_SIZE = 20; // 每批处理数量
  private readonly BATCH_DELAY = 50; // 批处理延迟(ms)
  private readonly MAX_QUEUE_SIZE = 1000; // 最大队列大小

  constructor(
    private dispatch: (action: { type: string; payload: SSEMessage[] }) => void
  ) {}

  addMessage(message: SSEMessage): void {
    this.messageQueue.push(message);

    if (this.messageQueue.length > this.MAX_QUEUE_SIZE) {
      console.warn("SSE queue overflow, truncating...");
      this.messageQueue = this.messageQueue.slice(-this.MAX_QUEUE_SIZE / 2);
    }

    this.scheduleBatch();
  }

  addMessages(messages: SSEMessage[]): void {
    this.messageQueue.push(...messages);

    if (this.messageQueue.length > this.MAX_QUEUE_SIZE) {
      this.messageQueue = this.messageQueue.slice(-this.MAX_QUEUE_SIZE / 2);
    }

    this.scheduleBatch();
  }

  private scheduleBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    if (this.messageQueue.length >= this.BATCH_SIZE) {
      this.processBatch();
      return;
    }

    this.batchTimer = window.setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  private processBatch(): void {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }
    this.isProcessing = true;
    const batch: SSEMessage[] = this.messageQueue.splice(0, this.BATCH_SIZE);
    updateLogText(batch);
    this.isProcessing = false;
    if (this.messageQueue.length > 0) {
      this.scheduleBatch();
    }
  }

  flush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.processBatch();
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.messageQueue = [];
  }
}
