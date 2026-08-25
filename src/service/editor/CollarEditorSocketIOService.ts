import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast";
import { SingleClientProvider } from "texhub-broadcast";
import { DocMeta } from "texhub-broadcast";
import * as Y from "yjs";
// @ts-ignore
import * as random from "lib0/random";
import { createExtensions } from "@/component/common/editor/foundation/extensions/extensions";
import { Compartment, EditorState } from "@codemirror/state";
import { readConfig } from "@/config/app/config-reader";
import {
  AuthHandler,
  RequestHandler,
  ResponseHandler,
  UserModel,
  WheelGlobal,
} from "rdjs-wheel";
import { BaseMethods } from "rdjs-wheel";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { projHasFile } from "../project/ProjectService";
import { Metadata } from "@/component/common/editor/foundation/extensions/language";
import {
  clearSocketIOProvider,
  setCurRootYDoc,
  setCurSubDoc,
  setSocketIOProvider,
  setWsConnState,
} from "../project/editor/EditorService";
import { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { getAccessToken } from "@/component/common/cache/Cache";
import { SubDocEventProps } from "@/model/props/yjs/subdoc/SubDocEventProps.js";
import store from "@/redux/store/store";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TeXFileType } from "@/model/enum/TeXFileType";
import logger from "@/common/storage/log/Logger";

export const usercolors = [
  { color: "#30bced", light: "#30bced33" },
  { color: "#6eeb83", light: "#6eeb8333" },
  { color: "#ffbc42", light: "#ffbc4233" },
  { color: "#ecd444", light: "#ecd44433" },
  { color: "#ee6352", light: "#ee635233" },
  { color: "#9ac2c9", light: "#9ac2c933" },
  { color: "#8acb88", light: "#8acb8833" },
  { color: "#1be7ff", light: "#1be7ff33" },
];
export const themeConfig = new Compartment();
export const userColor = usercolors[random.uint32() % usercolors.length];

// 自动重连采用指数退避：第 1 次 5s、第 2 次 10s、第 3 次 20s... 封顶 60s。
// 每次再叠加少量随机抖动，避免大量客户端同时重连打爆服务器。
const AUTO_RECONNECT_BASE_DELAY_MS = 5000;
const AUTO_RECONNECT_MAX_DELAY_MS = 60000;
const AUTO_RECONNECT_JITTER_MS = 2000;

let autoReconnectAttempts = 0;
let autoReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let manualReconnectRequired = false;

export const COLLABORATION_RECONNECT_EXHAUSTED_EVENT =
  "texhub:collaboration-reconnect-exhausted";

/**
 * 协作 WebSocket 每次真实建链（含重连成功）时广播的就绪事件。
 * 库内仅在新建 socket 时 emit 一次 status:"connected"，重连场景可能丢失；
 * 引擎级 "connect" 事件每次建链都会触发，以此为准驱动依赖方恢复。
 */
export const COLLABORATION_WS_READY_EVENT = "texhub:collaboration-ws-ready";

export function isManualReconnectRequired(): boolean {
  return manualReconnectRequired;
}

export function isAutoReconnectInProgress(): boolean {
  return autoReconnectTimer !== null && !manualReconnectRequired;
}

function clearAutoReconnectTimer() {
  if (autoReconnectTimer !== null) {
    clearTimeout(autoReconnectTimer);
    autoReconnectTimer = null;
  }
}

export function resetAutoReconnectState() {
  autoReconnectAttempts = 0;
  manualReconnectRequired = false;
  clearAutoReconnectTimer();
}

function getReconnectDelayMs(attempt: number): number {
  const exponential = AUTO_RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1);
  const capped = Math.min(exponential, AUTO_RECONNECT_MAX_DELAY_MS);
  const jitter = Math.floor(Math.random() * AUTO_RECONNECT_JITTER_MS);
  return capped + jitter;
}

function attemptProviderConnect(provider: SocketIOClientProvider) {
  provider.shouldConnect = true;
  const token = getAccessToken();
  if (provider.ws) {
    provider.ws.auth = { token };
    if (!provider.ws.connected) {
      provider.ws.connect();
    }
  } else {
    provider.connect();
  }
  attachProviderReconnectHooks(provider);
  setWsConnState("connecting");
}

// texhub-broadcast 库把断线重连挂在 Socket 的 "close" 事件上，
// 但 socket.io-client v4 的 Socket 不会发 "close"（该事件属于 Manager），
// 所以库内与前端 status:"disconnected" 链路实际从未触发。
// 这里直接监听 Socket 真实存在的 "disconnect" 事件来驱动重连循环。
const hookedSockets = new WeakSet<Socket>();

function attachProviderReconnectHooks(provider: SocketIOClientProvider) {
  const socket = provider.ws;
  if (!socket || hookedSockets.has(socket)) {
    return;
  }
  hookedSockets.add(socket);
  socket.on("disconnect", () => {
    onCollaborationDisconnected(provider);
  });
  // socket.io v4 的 Socket 每次真实建链（含重连成功）都会 emit "connect"。
  // 这里直接以它为准纠正 Redux 连接状态（不再单纯依赖库的 status 链路，
  // 该链路在断线场景已知不可靠），并广播就绪事件供延迟任务恢复。
  socket.on("connect", () => {
    resetAutoReconnectState();
    setWsConnState("connected");
    window.dispatchEvent(new CustomEvent(COLLABORATION_WS_READY_EVENT));
  });
}

function scheduleAutoReconnectAttempt(provider: SocketIOClientProvider) {
  clearAutoReconnectTimer();
  if (manualReconnectRequired) {
    setWsConnState("disconnected");
    return;
  }
  if (isCollaborationProviderConnected(provider)) {
    resetAutoReconnectState();
    return;
  }

  setWsConnState("connecting");
  autoReconnectTimer = setTimeout(async () => {
    autoReconnectTimer = null;
    if (isCollaborationProviderConnected(provider)) {
      resetAutoReconnectState();
      return;
    }
    if (manualReconnectRequired) {
      setWsConnState("disconnected");
      return;
    }

    autoReconnectAttempts += 1;
    logger.info("collaboration auto reconnect attempt", {
      attempt: autoReconnectAttempts,
    });

    if (AuthHandler.isTokenNeedRefresh(120)) {
      await RequestHandler.handleWebAccessTokenExpire();
    }
    attemptProviderConnect(provider);
  }, getReconnectDelayMs(autoReconnectAttempts + 1));
}

function onCollaborationDisconnected(provider: SocketIOClientProvider) {
  if (manualReconnectRequired) {
    setWsConnState("disconnected");
    return;
  }
  if (isCollaborationProviderConnected(provider)) {
    resetAutoReconnectState();
    setWsConnState("connected");
    return;
  }
  if (autoReconnectTimer === null) {
    scheduleAutoReconnectAttempt(provider);
  }
}

export function isCollaborationProviderConnected(provider: unknown): boolean {
  if (!provider || typeof provider !== "object") {
    return false;
  }
  const p = provider as {
    ws?: { connected?: boolean } | null;
    wsconnected?: boolean;
  };
  return p.ws?.connected === true;
}

/**
 * 手动或断线后恢复协作连接：刷新 token、恢复 shouldConnect 并触发 provider/socket 重连。
 */
export async function reconnectCollaboration(
  editorAttr: EditorAttr,
  loadFile: TexFileModel
): Promise<void> {
  resetAutoReconnectState();

  const provider = store.getState().projEditor
    .texEditorSocketIOWs as SocketIOClientProvider | null;

  if (isCollaborationProviderConnected(provider)) {
    setWsConnState("connected");
    return;
  }

  if (AuthHandler.isTokenNeedRefresh(120)) {
    await RequestHandler.handleWebAccessTokenExpire();
  }

  if (provider) {
    attemptProviderConnect(provider);
    setSocketIOProvider(provider);
    return;
  }

  SingleClientProvider.destroy();
  clearSocketIOProvider();
  initSubDocSocketIO(editorAttr, loadFile);
}

const handleWsAuth = (
  event: any,
  wsProvider: SocketIOClientProvider,
  editorAttr: EditorAttr,
  ydoc: Y.Doc
) => {
  if (event.status === "failed") {
    wsProvider.shouldConnect = false;
    wsProvider.ws?.close();
    manualReconnectRequired = true;
    clearAutoReconnectTimer();
    setWsConnState("disconnected");
  }
  if (event.status === "expired") {
    RequestHandler.handleWebAccessTokenExpire().then((res) => {
      if (ResponseHandler.responseSuccess(res)) {
        wsProvider.ws?.close();
        wsProvider = doSocketIOConn(ydoc, editorAttr, false);
      } else {
        wsProvider.shouldConnect = false;
        wsProvider.ws?.close();
      }
    });
  }
};

export const doSocketIOConn = (
  rootYDoc: Y.Doc,
  editorAttr: EditorAttr,
  enableSubDoc: boolean
): any => {
  let contains = projHasFile(editorAttr.docId, editorAttr.projectId);
  if (!contains) {
    console.error("initial the file do not belong the project");
  }
  if (AuthHandler.isTokenNeedRefresh(120)) {
    RequestHandler.handleWebAccessTokenExpire();
  }
  // avoid the cached expired token
  let options: Partial<ManagerOptions & SocketOptions> = {
    withCredentials: true,
    reconnection: false,
    transports: ["websocket", "polling"],
    tryAllTransports: true,
    path: "/sync",
    auth: {
      token: getAccessToken(),
    },
  };
  let sid = localStorage.getItem("shortFileId");
  let enableShortFileId = sid && sid.toString() === "short";
  const wsProvider: any = SingleClientProvider.getInstance(
    readConfig("socketUrl"),
    enableSubDoc ? editorAttr.projectId : editorAttr.docId,
    rootYDoc,
    enableSubDoc,
    options,
    {
      maxBackoffTime: 1000000,
      params: {
        // https://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#query-param
        access_token: localStorage.getItem(WheelGlobal.ACCESS_TOKEN_NAME) ?? "",
        docId: enableSubDoc ? editorAttr.projectId : editorAttr.docId,
        docIntId: editorAttr.docIntId,
        docShowName: editorAttr.docShowName,
        enableSid: enableShortFileId,
        projId: editorAttr.projectId,
        docType: enableSubDoc ? TeXFileType.PROJECT : TeXFileType.TEX,
        // from: "web_tex_editor",
      },
    }
  );
  const uInfo = localStorage.getItem("userInfo");
  if (!uInfo) {
    console.error("user info is null", uInfo);
    return wsProvider;
  }
  const user: UserModel = JSON.parse(uInfo);
  const ydocUser = {
    name: user.nickname,
    color: userColor.color,
    colorLight: userColor.light,
  };
  const permanentUserData = new Y.PermanentUserData(rootYDoc);
  permanentUserData.setUserMapping(rootYDoc, rootYDoc.clientID, ydocUser.name);
  wsProvider.awareness.setLocalStateField("user", ydocUser);
  // @ts-ignore
  wsProvider.on("auth", (event: any) => {
    // https://discuss.yjs.dev/t/how-to-refresh-the-wsprovider-params-when-token-expire/2131
    handleWsAuth(event, wsProvider, editorAttr, rootYDoc);
  });
  // @ts-ignore
  wsProvider.on("connect_error", (err: any) => {
    console.error("connection error:" + editorAttr.docId, err);
    console.error(err.message);
    console.error(err.description);
    console.error(err.context);
    if (!manualReconnectRequired) {
      setWsConnState("connecting");
      // 连接尝试失败不会触发 Socket 的 "disconnect"，需要在此驱动下一次退避重试
      onCollaborationDisconnected(wsProvider);
    } else {
      setWsConnState("disconnected");
    }
  });
  // @ts-ignore
  wsProvider.on("message", (event: MessageEvent) => {});
  // @ts-ignore
  wsProvider.on("status", (event: any) => {
    if (event.status === "connected") {
      resetAutoReconnectState();
      setWsConnState("connected");
    } else if (event.status === "disconnected") {
      onCollaborationDisconnected(wsProvider);
    } else {
      setWsConnState("connecting");
    }
  });
  attachProviderReconnectHooks(wsProvider);
  return wsProvider;
};

export const metadata: Metadata = {
  labels: new Set<string>([]),
  packageNames: new Set<string>([]),
  commands: [],
  referenceKeys: new Set<string>([]),
  fileTreeData: {
    _id: "1",
    name: "a.tex",
    docs: [],
    folders: [],
    fileRefs: [],
  },
};

export function initSubDocSocketIO(
  editorAttr: EditorAttr,
  loadFile: TexFileModel
) {
  resetAutoReconnectState();
  let rootDocOpt = {
    guid: editorAttr.projectId,
    collectionid: editorAttr.projectId,
    // https://discuss.yjs.dev/t/error-garbage-collection-must-be-disabled-in-origindoc/2313
    gc: false,
  };
  let rootYdoc: Y.Doc = new Y.Doc(rootDocOpt);
  let rootDocMetadata: DocMeta = {
    name: editorAttr.projectId,
    id: "-1",
    src: "initSubDocSocketIO",
  };
  rootYdoc.meta = rootDocMetadata;
  // init room with project id
  let wsProvider: SocketIOClientProvider = doSocketIOConn(
    rootYdoc,
    editorAttr,
    true
  );

  console.log("WebSocket provider created:", wsProvider);
  // @ts-ignore
  rootYdoc.on("subdocs", (props: SubDocEventProps) => {
    handleSubDocChanged(props, wsProvider);
  });
  setCurRootYDoc(rootYdoc);
  // @ts-ignore
  wsProvider.on("synced", () => {
    if (loadFile) {
      // when run this first doc init, there contains 2 subdoc
      // still did not found where to add this 2 subdoc
      initialFisrtSubDoc(loadFile);
    }
  });
  // @ts-ignore
  wsProvider.on("connectionStatus", (status: any) => {
    console.log("WebSocket provider connection status:", status);
  });
  setSocketIOProvider(wsProvider);
}

const initialFisrtSubDoc = (file: TexFileModel) => {
  const current = store.getState().projEditor.curSubYDoc;
  if (current && !BaseMethods.isNull(current) && current.guid) {
    console.log("already has active subdoc, skip initialFisrtSubDoc");
    return; // 已有激活 subdoc，不强制切回 loadFile
  }
  // 优先复用 root doc texhubsubdoc map 中已存在的 subdoc 实例。
  // 若每个浏览器都各自 new 一个同 guid 的实例并嵌入 map，root doc 同步时会触发
  // Yjs 冲突销毁其中一个实例，导致该浏览器编辑器绑定的 subdoc 失效。
  const rootYDoc = store.getState().projEditor.curRootYDoc;
  let firstSubDoc: Y.Doc;
  const existing =
    rootYDoc &&
    typeof rootYDoc.getMap === "function"
      ? rootYDoc.getMap("texhubsubdoc").get(file.file_id)
      : undefined;
  if (existing && !BaseMethods.isNull(existing)) {
    firstSubDoc = existing;
    firstSubDoc.load();
  } else {
    firstSubDoc = new Y.Doc();
    firstSubDoc.guid = file.file_id;
  }
  let docMetadata: DocMeta = {
    name: file.name,
    id: file.id,
    src: "initialFisrtSubDoc",
  };
  firstSubDoc.meta = docMetadata;
  if (file.main_flag === 1) {
    logger.warn("initial main doc", { file });
  }
  setCurSubDoc(firstSubDoc);
};

const handleSubDocChanged = (
  props: SubDocEventProps,
  wsProvider: SocketIOClientProvider
) => {
  // Yjs 的 subdocs 事件有两种触发形态：
  // 1) 本地新建/嵌入 subdoc：added 与 loaded 同时包含该 doc；
  // 2) 从服务端反序列化（shouldLoad=false）后调用 .load() 再次打开：
  //    首次嵌入只出现在 added，.load() 时又单独触发一次 loaded。
  // 因此必须取 added 与 loaded 的并集统一注册，否则从服务端下发的 subdoc
  // 会漏掉 addSubdoc：其 update handler 不挂载，本地编辑只会进入 Y.Text
  // （触发 editor 的 observer 日志），而不会广播 SubDocMessageSync。
  const toRegister = new Set<Y.Doc>();
  if (props && props.added) {
    props.added.forEach((subdoc) => toRegister.add(subdoc));
  }
  if (props && props.loaded) {
    props.loaded.forEach((subdoc) => toRegister.add(subdoc));
  }
  toRegister.forEach((subdoc) => {
    if (subdoc && subdoc.guid) {
      console.log("add sub doc:" + subdoc.guid);
      // addSubdoc 是幂等的：内部会先解绑旧 handler 再绑定新 handler，
      // 并把 doc 放进 provider.docs、发送 sync_step_1 拉取内容。
      wsProvider.addSubdoc(subdoc);
    }
  });
  if (props && props.removed && props.removed.size > 0) {
    // use removed to sync documents in the background
    handleSubDocRemoved(props, wsProvider);
    // 防御：若当前编辑器绑定的 subdoc 实例被 Yjs 销毁（如跨端同 guid 冲突时
    // root doc 的 texhubsubdoc map 项被替换），尝试改挂到替换进来的同 guid
    // 新实例上，避免编辑器失联、不再触发 subdoc update。
    const current = store.getState().projEditor.curSubYDoc;
    if (
      current &&
      !BaseMethods.isNull(current) &&
      current.guid &&
      props.removed.has(current)
    ) {
      const replacement = Array.from(toRegister).find(
        (subdoc) => subdoc.guid === current.guid && subdoc !== current
      );
      if (replacement) {
        console.warn(
          "re-adopt replacement subdoc for destroyed active doc:",
          current.guid
        );
        setCurSubDoc(replacement);
      }
    }
  }
};

const handleSubDocRemoved = (
  props: SubDocEventProps,
  wsProvider: SocketIOClientProvider
) => {
  props.removed.forEach((subdoc) => {
    console.warn("handleSubDocRemoved remove sub doc:" + subdoc.guid);
    //wsProvider.removeSubdoc(subdoc);
  });
};
