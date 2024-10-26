import { EditorView } from "@codemirror/view";
// @ts-ignore
import { WebsocketProvider } from "rdy-websocket";
import * as Y from "yjs";
import * as random from "lib0/random";
import { createExtensions } from "@/component/common/editor/foundation/extensions/extensions";
import { Compartment, EditorState } from "@codemirror/state";
import { readConfig } from "@/config/app/config-reader";
import {
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
  setWebsocketProvider,
  setWsConnState,
} from "../project/editor/EditorService";
import { handleYDocUpdate } from "@/component/common/collar/ver/YjsEvent";

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
  wsProvider: WebsocketProvider,
  editorAttr: EditorAttr,
  ydoc: Y.Doc
) => {
  if (event.status === "failed") {
    wsProvider.shouldConnect = false;
    wsProvider.ws?.close();
  }
  if (event.status === "expired") {
    RequestHandler.handleWebAccessTokenExpire().then((res) => {
      if (ResponseHandler.responseSuccess(res)) {
        wsProvider.ws?.close();
        wsProvider = doWsConn(ydoc, editorAttr);
      } else {
        wsProvider.shouldConnect = false;
        wsProvider.ws?.close();
      }
    });
  }
};

const doWsConn = (ydoc: Y.Doc, editorAttr: EditorAttr): WebsocketProvider => {
  let contains = projHasFile(editorAttr.docId, editorAttr.projectId);
  if (!contains) {
    console.error("initial the file do not belong the project");
  }
  const wsProvider: WebsocketProvider = new WebsocketProvider(
    readConfig("wssUrl"),
    editorAttr.docId,
    ydoc,
    {
      maxBackoffTime: 1000000,
      params: {
        // https://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#query-param
        access_token: localStorage.getItem(WheelGlobal.ACCESS_TOKEN_NAME) ?? "",
        from: "web_tex_editor",
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
  wsProvider.on("connection-error", (event: any) => {
    console.error("connection error:" + editorAttr.docId, event);
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
var ydoc: Y.Doc;
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

export function initEditor(
  editorAttr: EditorAttr,
  activeEditorView: EditorView | undefined,
  edContainer: RefObject<HTMLDivElement>,
  legacyWs: WebsocketProvider | undefined
) {
  if (legacyWs) {
    // close the legacy websocket to avoid 1006 disconnect on the server side
    legacyWs.ws?.close(1000,"client send close signal");
  }
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
  let wsProvider: WebsocketProvider = doWsConn(ydoc, editorAttr);
  ydoc.on("update", (update, origin) => {
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
  setWebsocketProvider(wsProvider);
}
