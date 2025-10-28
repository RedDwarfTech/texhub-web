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

  // 添加消息到队列
  addMessage(message: SSEMessage): void {
    this.messageQueue.push(message);

    // 队列保护
    if (this.messageQueue.length > this.MAX_QUEUE_SIZE) {
      console.warn("SSE queue overflow, truncating...");
      this.messageQueue = this.messageQueue.slice(-this.MAX_QUEUE_SIZE / 2);
    }

    this.scheduleBatch();
  }

  // 批量添加多个消息
  addMessages(messages: SSEMessage[]): void {
    this.messageQueue.push(...messages);

    if (this.messageQueue.length > this.MAX_QUEUE_SIZE) {
      this.messageQueue = this.messageQueue.slice(-this.MAX_QUEUE_SIZE / 2);
    }

    this.scheduleBatch();
  }

  // 调度批处理（防抖）
  private scheduleBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // 立即处理：达到批次大小
    if (this.messageQueue.length >= this.BATCH_SIZE) {
      this.processBatch();
      return;
    }

    // 延迟处理：防抖
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
    // 如果还有剩余消息，继续处理
    if (this.messageQueue.length > 0) {
      this.scheduleBatch();
    }
  }

  // 手动立即处理所有剩余消息
  flush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.processBatch();
  }

  // 获取当前队列状态
  getQueueSize(): number {
    return this.messageQueue.length;
  }

  // 清理
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.messageQueue = [];
  }
}
