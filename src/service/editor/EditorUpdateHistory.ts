import logger from "@/common/storage/log/Logger";

/**
 * EditorView 更新历史记录接口
 */
export interface EditorViewUpdateRecord {
  timestamp: number;
  source: string;
  action: string;
  callStack?: string;
}

/**
 * 编辑器更新历史记录存储
 */
const editorViewUpdateHistory: EditorViewUpdateRecord[] = [];

/**
 * 记录 EditorView 的更新事件
 * @param source 更新来源（如函数名、useEffect 名称）
 * @param action 更新的具体动作描述
 */
export const recordEditorViewUpdate = (source: string, action: string): void => {
  const record: EditorViewUpdateRecord = {
    timestamp: Date.now(),
    source,
    action,
    callStack: new Error().stack?.split('\n').slice(2, 8).join('\n'),
  };
  editorViewUpdateHistory.push(record);

  // 保持历史记录不超过 100 条
  if (editorViewUpdateHistory.length > 100) {
    editorViewUpdateHistory.shift();
  }

  logger.info(
    `[EditorView Update] ${source} - ${action}`,
    JSON.stringify(record)
  );

  // 也可以输出到控制台便于调试
  console.log(
    `%c[EditorView Update] ${source} - ${action}`,
    'color: #ff6b6b; font-weight: bold;',
    record
  );
};

/**
 * 获取编辑器更新历史记录
 * 用于浏览器控制台调试：getEditorViewUpdateHistory()
 */
export const getEditorViewUpdateHistory = (): EditorViewUpdateRecord[] => {
  return editorViewUpdateHistory;
};

/**
 * 清空编辑器更新历史记录
 */
export const clearEditorViewUpdateHistory = (): void => {
  editorViewUpdateHistory.length = 0;
};

/**
 * 获取指定来源的更新历史
 */
export const getEditorViewUpdateHistoryBySource = (
  source: string
): EditorViewUpdateRecord[] => {
  return editorViewUpdateHistory.filter((record) => record.source.includes(source));
};

/**
 * 获取最近 N 条更新历史
 */
export const getRecentEditorViewUpdates = (
  count: number = 10
): EditorViewUpdateRecord[] => {
  return editorViewUpdateHistory.slice(-count);
};

// 导出到全局 window 对象便于浏览器控制台调试
if (typeof window !== 'undefined') {
  (window as any).getEditorViewUpdateHistory = getEditorViewUpdateHistory;
  (window as any).getEditorViewUpdateHistoryBySource = getEditorViewUpdateHistoryBySource;
  (window as any).getRecentEditorViewUpdates = getRecentEditorViewUpdates;
  (window as any).clearEditorViewUpdateHistory = clearEditorViewUpdateHistory;
}
