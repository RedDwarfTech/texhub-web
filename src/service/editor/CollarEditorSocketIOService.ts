import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast";
import { SingleClientProvider } from "texhub-broadcast";
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
  setCurRootYDoc,
  setCurSubYDoc,
  setEditorInstance,
  setEditorText,
  setSocketIOProvider,
  setWsConnState,
} from "../project/editor/EditorService";
import { handleYDocUpdate } from "@/component/common/collar/ver/YjsEvent";
import { ManagerOptions, SocketOptions } from "socket.io-client";
import { getAccessToken } from "@/component/common/cache/Cache";
import { ProjInfo } from "@/model/proj/ProjInfo.js";
import { SubDocEventProps } from "@/model/props/yjs/subdoc/SubDocEventProps.js";
import { ySyncAnnotation, ySyncFacet } from "rdy-codemirror.next";
// @ts-ignore
import { DocOpts } from "rdyjs/dist/src/utils/Doc.mjs";
import store from "@/redux/store/store";
// @ts-ignore
import { decoding } from "rdlib0";
import { TexFileModel } from "@/model/file/TexFileModel";

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
  wsProvider: SocketIOClientProvider,
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
        wsProvider = doSocketIOConn(ydoc, editorAttr, false);
      } else {
        wsProvider.shouldConnect = false;
        wsProvider.ws?.close();
      }
    });
  }
};

const doSocketIOConn = (
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
        docIntId: editorAttr.docIntId
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
    // the reason of the error, for example "xhr poll error"
    console.error(err.message);

    // some additional description, for example the status code of the initial HTTP response
    console.error(err.description);

    // some additional context, for example the XMLHttpRequest object
    console.error(err.context);
  });
  // @ts-ignore
  wsProvider.on("message", (event: MessageEvent) => {});
  // @ts-ignore
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

export function initSocketIOEditor(
  editorAttr: EditorAttr,
  activeEditorView: EditorView | undefined,
  edContainer: RefObject<HTMLDivElement>
) {
  if (activeEditorView && !BaseMethods.isNull(activeEditorView)) {
    activeEditorView.destroy();
  }
  if (SingleClientProvider.getCurrentRoom() !== editorAttr.docId) {
    // user siwtch docs
    SingleClientProvider.destroy();
  }
  let docOpt: DocOpts = {
    guid: editorAttr.docId,
    collectionid: editorAttr.projectId,
    // https://discuss.yjs.dev/t/error-garbage-collection-must-be-disabled-in-origindoc/2313
    gc: false,
  };
  ydoc = new Y.Doc(docOpt);
  setCurRootYDoc(ydoc);
  const ytext: Y.Text = ydoc.getText(editorAttr.docId);
  let wsProvider: SocketIOClientProvider = doSocketIOConn(
    ydoc,
    editorAttr,
    false
  );
  ydoc.on("update", (update: any, origin: any) => {
    handleYDocUpdate(editorAttr, ytext, ydoc);
  });

  const undoManager = new Y.UndoManager(ytext);
  if (!wsProvider) {
    return;
  }

  const texEditorState: EditorState = EditorState.create({
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
  file: TexFileModel
) {
  let rootDocOpt = {
    guid: editorAttr.projectId,
    collectionid: editorAttr.projectId,
    // https://discuss.yjs.dev/t/error-garbage-collection-must-be-disabled-in-origindoc/2313
    gc: false,
  };
  let rootYdoc: Y.Doc = new Y.Doc(rootDocOpt);
  // init room with project id
  let wsProvider: SocketIOClientProvider = doSocketIOConn(
    rootYdoc,
    editorAttr,
    true
  );
  // @ts-ignore
  wsProvider.on("synced", () => {
    debugger;
    // initial last doc
    if (file) {
      // remove all subdocs
      // when run this first doc init, there contains 2 subdoc
      // still did not found where to add this 2 subdoc
      initialFisrtSubDoc(file, rootYdoc, activeEditorView);
    }
  });
  setSocketIOProvider(wsProvider);
  // @ts-ignore
  rootYdoc.on("subdocs", (props: SubDocEventProps) => {
    handleSubDocChanged(props, wsProvider);
  });
  setCurRootYDoc(rootYdoc);
}

const initialFisrtSubDoc = (
  file: TexFileModel,
  rootDoc: Y.Doc,
  editorView: EditorView | undefined
) => {
  let firstSubDoc = new Y.Doc();
  firstSubDoc.guid = file.file_id;
  const subDocText = firstSubDoc.getText(firstSubDoc.guid);
  subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
    updateEditor(editorView, tr, event, firstSubDoc);
  });
  rootDoc.getMap("texhubsubdoc").set(file.file_id, firstSubDoc);
  setCurRootYDoc(rootDoc);
  setCurSubYDoc(firstSubDoc);
};

export const updateEditor = (
  editorView: EditorView | undefined,
  tr: Y.Transaction,
  event: Y.YTextEvent,
  doc: Y.Doc
) => {
  console.log("subdocument observed:", doc.guid);
  if (!editorView) {
    console.error("EditorView is null:");
    return;
  }
  let conf = editorView.state.facet(ySyncFacet);
  const delta = event.delta;
  const changes = [];
  let pos = 0;
  for (let i = 0; i < delta.length; i++) {
    const d = delta[i];
    if (d.insert != null) {
      changes.push({ from: pos, to: pos, insert: d.insert });
    } else if (d.delete != null) {
      changes.push({ from: pos, to: pos + d.delete, insert: "" });
      pos += d.delete;
    } else {
      pos += d.retain!;
    }
  }
  if (changes.length === 0) {
    console.warn("No changes found in the delta.");
    return;
  }
  editorView.dispatch({
    // @ts-ignore
    changes,
    annotations: [ySyncAnnotation.of(conf)],
  });
};

const handleSubDocChanged = (
  props: SubDocEventProps,
  wsProvider: SocketIOClientProvider
) => {
  if (props && props.added && props.added.size > 0) {
    // use added to sync documents in the background
    handleSubDocAdd(props, wsProvider);
  }
  if (props && props.removed && props.removed.size > 0) {
    // use removed to sync documents in the background
    handleSubDocRemoved(props, wsProvider);
  }
  if (props && props.loaded && props.loaded.size > 0) {
    // use loaded to fill document content
    handleLoadedSubDoc(props.loaded);
  }
};

const handleLoadedSubDoc = (subdocs: Set<Y.Doc>) => {
  subdocs.forEach((subdoc: Y.Doc) => {
    let subDocText = subdoc.getText();
    let subDocTextString = subDocText.toString();
    if (!subDocTextString || subDocTextString.length === 0) {
      console.error("subdoc text is null:" + subdoc.guid);
      return;
    }
    console.log("trigger subdoc loaded to fill content:" + subdoc.guid);
    debugger;
    // Get the current editor view from Redux store
    const { editorView } = store.getState().projEditor;
    if (editorView) {
      // Update CodeMirror content
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: subDocTextString,
        },
      });
    }
  });
};

const handleSubDocAdd = (
  props: SubDocEventProps,
  wsProvider: SocketIOClientProvider
) => {
  props.loaded.forEach((subdoc: Y.Doc) => {
    console.log("add sub doc:" + subdoc.guid);
    wsProvider.addSubdoc(subdoc);
  });
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
