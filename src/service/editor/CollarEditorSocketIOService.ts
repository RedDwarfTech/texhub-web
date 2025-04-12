import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider";
import * as Y from "rdyjs";
// @ts-ignore
import * as random from "rdlib0/random";
import { createExtensions } from "@/component/common/editor/foundation/extensions/extensions";
import { Compartment, EditorState } from "@codemirror/state";
import { readConfig } from "@/config/app/config-reader";
import {
  AuthHandler,
  BaseMethods,
  RequestHandler,
  ResponseHandler,
  UserModel,
  WheelGlobal,
} from "rdjs-wheel";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { RefObject } from "react";
import { projHasFile } from "../project/ProjectService";
import { Metadata } from "@/component/common/editor/foundation/extensions/language";
import {
  setCurYDoc,
  setEditorInstance,
  setSocketIOProvider,
  setWsConnState,
} from "../project/editor/EditorService";
import { handleYDocUpdate } from "@/component/common/collar/ver/YjsEvent";
import { ManagerOptions, SocketOptions } from "socket.io-client";
import { getAccessToken } from "@/component/common/cache/Cache";
import { ProjInfo } from "@/model/proj/ProjInfo.js";
import { TexFileModel } from "@/model/file/TexFileModel.js";
import { SubDocEventProps } from "@/model/props/yjs/subdoc/SubDocEventProps.js";

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
const wsMaxRetries = 1;
let wsRetryCount = 0;

const handleWsAuth = (
  event: any,
  wsProvider: any,
  editorAttr: EditorAttr,
  ydoc: Y.Doc
) => {
  if (event.status === "failed") {
    wsProvider.shouldConnect = false;
    wsProvider.ws?.close(1000, "failed when connect");
  }
  if (event.status === "expired") {
    RequestHandler.handleWebAccessTokenExpire().then((res) => {
      if (ResponseHandler.responseSuccess(res)) {
        wsProvider.ws?.close(1000, "expired refresh success");
        wsProvider = doSocketIOConn(ydoc, editorAttr, false);
      } else {
        wsProvider.shouldConnect = false;
        wsProvider.ws?.close(1000, "expired refresh failed");
      }
    });
  }
};

const doSocketIOConn = (
  ydoc: Y.Doc,
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
    reconnection: true,
    reconnectionDelay: 15000,
    reconnectionDelayMax: 15000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
    tryAllTransports: true,
    path: "/sync",
    auth: {
      token: getAccessToken(),
    },
  };
  const wsProvider: any = new SocketIOClientProvider(
    readConfig("socketUrl"),
    enableSubDoc ? editorAttr.projectId : editorAttr.docId,
    ydoc,
    enableSubDoc,
    options,
    {
      maxBackoffTime: 1000000,
      params: {
        // https://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#query-param
        access_token: localStorage.getItem(WheelGlobal.ACCESS_TOKEN_NAME) ?? "",
        docId: editorAttr.docId,
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
  const permanentUserData = new Y.PermanentUserData(ydoc);
  permanentUserData.setUserMapping(ydoc, ydoc.clientID, ydocUser.name);
  wsProvider.awareness.setLocalStateField("user", ydocUser);
  wsProvider.on("auth", (event: any) => {
    // https://discuss.yjs.dev/t/how-to-refresh-the-wsprovider-params-when-token-expire/2131
    handleWsAuth(event, wsProvider, editorAttr, ydoc);
  });
  wsProvider.on("connect_error", (err: any) => {
    console.error("connection error:" + editorAttr.docId, err);
    // the reason of the error, for example "xhr poll error"
    console.error(err.message);

    // some additional description, for example the status code of the initial HTTP response
    console.error(err.description);

    // some additional context, for example the XMLHttpRequest object
    console.error(err.context);
  });
  wsProvider.on("message", (event: MessageEvent) => {});
  wsProvider.on("status", (event: any) => {
    if (event.status === "connected") {
      setWsConnState("connected");
    } else if (event.status === "disconnected" && wsRetryCount < wsMaxRetries) {
      setWsConnState("connecting");
    } else {
      setWsConnState("disconnected");
    }
  });
  return wsProvider;
};

let history: Uint8Array[] = [];
var ydoc: any;
export function saveHistory(docId: string) {
  const update = Y.encodeStateAsUpdate(ydoc);
  history.push(update);
  const snapshot = Y.snapshot(ydoc);
  let snap: Uint8Array = Y.encodeSnapshot(snapshot);
  const decoder = new TextDecoder("utf-8");
  const snapString = decoder.decode(snap);
  const text = ydoc.getText(docId);
  console.log(text.toString());
}

export function restoreFromHistory(version: number, docId: string) {
  if (ydoc) {
    const snapshot = history[version];
    Y.applyUpdate(ydoc, snapshot);
    const txt = ydoc.getText(docId);
    console.log(txt.toString());
  }
}

const metadata: Metadata = {
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

export function initSocketIOEditor(
  editorAttr: EditorAttr,
  activeEditorView: EditorView | undefined,
  edContainer: RefObject<HTMLDivElement>
) {
  if (activeEditorView && !BaseMethods.isNull(activeEditorView)) {
    activeEditorView.destroy();
  }
  let docOpt = {
    guid: editorAttr.docId,
    collectionid: editorAttr.projectId,
    // https://discuss.yjs.dev/t/error-garbage-collection-must-be-disabled-in-origindoc/2313
    gc: false,
  };
  ydoc = new Y.Doc(docOpt);
  setCurYDoc(ydoc);
  const ytext: Y.Text = ydoc.getText(editorAttr.docId);
  const undoManager = new Y.UndoManager(ytext);
  let wsProvider: SocketIOClientProvider = doSocketIOConn(
    ydoc,
    editorAttr,
    false
  );
  ydoc.on("update", (update: any, origin: any) => {
    handleYDocUpdate(editorAttr, ytext, ydoc);
  });
  const texEditorState = EditorState.create({
    doc: ytext.toString(),
    extensions: createExtensions({
      ytext: ytext,
      wsProvider: wsProvider,
      undoManager: undoManager,
      docName: docOpt.guid,
      metadata: metadata,
    }),
  });
  if (
    edContainer.current &&
    edContainer.current.children &&
    edContainer.current.children.length > 0
  ) {
    return;
  }
  const editorView: EditorView = new EditorView({
    state: texEditorState,
    parent: edContainer.current!,
  });
  setEditorInstance(editorView);
  setSocketIOProvider(wsProvider);
}

export function initSubDocSocketIO(
  editorAttr: EditorAttr,
  activeEditorView: EditorView | undefined,
  edContainer: RefObject<HTMLDivElement>,
  projInfo: ProjInfo
) {
  console.log("initSubDocSocketIO");
  if (activeEditorView && !BaseMethods.isNull(activeEditorView)) {
    activeEditorView.destroy();
  }
  let rootDocOpt = {
    guid: editorAttr.projectId,
    collectionid: editorAttr.projectId,
    // https://discuss.yjs.dev/t/error-garbage-collection-must-be-disabled-in-origindoc/2313
    gc: false,
  };
  let rootYdoc: Y.Doc = new Y.Doc(rootDocOpt);
  // @ts-ignore
  rootYdoc.on("subdocs", (props: SubDocEventProps) => {
    console.warn("trigger sub docs");
    props.loaded.forEach((subdoc) => {
      console.warn("add sub docs");
      wsProvider.addSubdoc(subdoc);
    });
  });
  setCurYDoc(rootYdoc);
  const ytext: Y.Text = rootYdoc.getText(editorAttr.projectId);
  const undoManager = new Y.UndoManager(ytext);
  // init room with project id
  let wsProvider: SocketIOClientProvider = doSocketIOConn(
    rootYdoc,
    editorAttr,
    true
  );
  // initial last doc
  if (projInfo && projInfo.tree) {
    initialSub(projInfo.tree, rootYdoc);
  }
  // load the initial subdocument
  let initDoc: any = rootYdoc.getMap().get(editorAttr.docId);
  if (initDoc) {
    console.warn("load initial doc:" + editorAttr.docId);
    initDoc.load();
  } else {
    console.error("did not found initial doc:" + editorAttr.docId);
  }
  // @ts-ignore
  rootYdoc.on("update", (update: any, origin: any) => {});
  

  const texEditorState = EditorState.create({
    doc: ytext.toString(),
    extensions: createExtensions({
      ytext: ytext,
      wsProvider: wsProvider,
      undoManager: undoManager,
      docName: rootDocOpt.guid,
      metadata: metadata,
    }),
  });
  if (
    edContainer.current &&
    edContainer.current.children &&
    edContainer.current.children.length > 0
  ) {
    return;
  }
  const editorView: EditorView = new EditorView({
    state: texEditorState,
    parent: edContainer.current!,
  });
  setEditorInstance(editorView);
  setSocketIOProvider(wsProvider);
}

const initialSub = (tree: TexFileModel[], rootDoc: Y.Doc) => {
  if (tree && tree.length > 0) {
    const folder = rootDoc.getMap();
    tree.forEach((item: TexFileModel) => {
      const subDoc: Y.Doc = new Y.Doc();
      subDoc.guid = item.file_id.toString();
      folder.set(item.file_id.toString(), subDoc);
      if (item.children && item.children.length > 0) {
        initialSub(item.children, rootDoc);
      }
    });
  }
};
