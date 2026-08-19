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
 */
async function probeBroadcastHealth(): Promise<Record<string, any>> {
  const socketUrl = readConfig("socketUrl");
  if (!socketUrl) {
    return { unavailable: "socketUrl not configured" };
  }
  // socketUrl 形如 wss://socket.poemhub.top 或 https://socket.poemhub.top/xxx
  const httpBase = socketUrl.replace(/^wss?:\/\//, "https://").replace(/\/+$/, "");
  const probePath = (path: string): Promise<Record<string, unknown>> =>
    fetch(`${httpBase}${path}`, { signal: AbortSignal.timeout(5000) })
      .then((res) => ({ status: res.status, ok: res.ok }))
      .catch((e: any) => ({ error: String(e?.message ?? e) }));

  const [healthz, ready] = await Promise.all([
    probePath("/health/healthz"),
    probePath("/health/ready"),
  ]);
  return { socketUrl, healthz, ready };
}

/**
 * 汇总文件切换 / 协作连接失败时的上下文、WebSocket 连接信息与
 * texhub-broadcast 服务状态，并上报到系统日志接口。
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
    broadcast: await probeBroadcastHealth(),
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