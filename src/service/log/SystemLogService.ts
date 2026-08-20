import { XHRClient } from "rd-component";
import { readConfig } from "@/config/app/config-reader";
import store from "@/redux/store/store";
import { getRecentEditorViewUpdates } from "@/service/editor/EditorUpdateHistory";
import {
  isAutoReconnectInProgress,
  isManualReconnectRequired,
} from "@/service/editor/CollarEditorSocketIOService";

export interface SystemLogReq {
  logTime?: number;
  content: string;
  source: string;
  level: string;
  appId: string;
}

/**
 * 保存系统运行日志到 infra-server（POST /infra-inner/log/save）。
 * 失败静默，不阻塞业务。
 */
export function saveSystemLog(req: SystemLogReq): Promise<any> {
  const config = {
    method: "post",
    url: "/infra-inner/log/save",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify(req),
  };
  return XHRClient.requestWithoutAction(config);
}

/**
 * 提取协作 WebSocket provider 的连接信息（socket.io + broadcast 状态）。
 */
function collectWsInfo(provider: any): Record<string, any> {
  if (!provider) {
    return { present: false };
  }
  return {
    present: true,
    url: provider.url,
    roomname: provider.roomname,
    enableSubDoc: provider.enableSubDoc,
    shouldConnect: provider.shouldConnect,
    wsconnected: provider.wsconnected,
    wsconnecting: provider.wsconnecting,
    bcconnected: provider.bcconnected,
    synced: provider.synced,
    wsLastMessageReceived: provider.wsLastMessageReceived,
    wsUnsuccessfulReconnects: provider.wsUnsuccessfulReconnects,
    ws: provider.ws
      ? {
          connected: provider.ws.connected,
          disconnected: provider.ws.disconnected,
          id: provider.ws.id,
        }
      : null,
  };
}

/**
 * 探测 texhub-broadcast 服务的健康状态（healthz / ready），带超时。
 * 已迁移到后端：由 infra-server 保存日志时从内网主动探测，
 * 服务状态接口不对外暴露，前端不再直接访问。
 * @deprecated 服务状态探测已移至后端（system_log_service::probe_related_services）
 */

/**
 * 汇总文件切换 / 协作连接失败时的上下文与 WebSocket 连接信息，
 * 上报到系统日志接口；关联服务（texhub-broadcast）状态由后端探测并合并入库。
 */
export async function reportFileSwitchFailed(context: {
  projectId: string;
  guid?: string;
  provider?: any;
  pendingGuid?: string | null;
  reason?: string;
}): Promise<void> {
  const state = store.getState();
  const { projEditor, file } = state;
  const content = {
    event: "file_switch_failed_ws",
    reason: context.reason ?? "collaboration connection is not ready",
    projectId: context.projectId,
    guid: context.guid,
    activeFile: file.activeFile
      ? {
          id: file.activeFile.id,
          fileId: file.activeFile.file_id,
          name: file.activeFile.name,
        }
      : null,
    wsConnState: projEditor.wsConnState,
    manualReconnectRequired: isManualReconnectRequired(),
    autoReconnectInProgress: isAutoReconnectInProgress(),
    pendingGuid: context.pendingGuid ?? null,
    ws: collectWsInfo(context.provider ?? projEditor.texEditorSocketIOWs),
    editorViewUpdates: getRecentEditorViewUpdates(10),
  };

  try {
    await saveSystemLog({
      content: JSON.stringify(content),
      source: "texhub-web",
      level: "WARN",
      logTime: Date.now(),
      appId: readConfig("appId"),
    });
  } catch (e) {
    console.error("report file switch failed log error", e);
  }
}