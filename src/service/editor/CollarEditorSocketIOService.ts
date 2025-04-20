import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider";
import SingleClientProvider from "texhub-broadcast/dist/websocket/conn/single_client_provider";
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
import { DocOpts } from "rdyjs/dist/src/utils/Doc";
import store from "@/redux/store/store";
// @ts-ignore
import { decoding } from "rdlib0";

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
  
  const wsProvider: any = SingleClientProvider.getInstance(
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
  if(SingleClientProvider.getCurrentRoom() !== editorAttr.docId){
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
  setCurYDoc(ydoc);
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

function initEditorView(
  docOpts: DocOpts,
  wsProvider: SocketIOClientProvider,
  edContainer: RefObject<HTMLDivElement>
) {
  // Get initial editor text from Redux store
  const { editorText } = store.getState().projEditor;

  const ytext = new Y.Text(editorText || "");
  const undoManager = new Y.UndoManager(ytext);

  const texEditorState: EditorState = EditorState.create({
    doc: editorText || "",
    extensions: createExtensions({
      ytext: ytext,
      wsProvider: wsProvider,
      undoManager: undoManager,
      docName: docOpts.guid,
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

  // Subscribe to editorText changes
  store.subscribe(() => {
    const { editorText: newEditorText } = store.getState().projEditor;
    console.log("newEditorText:" + newEditorText);
    if (newEditorText !== editorText) {
      // Update editor content when editorText changes
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newEditorText || "",
        },
      });
    }
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
    props.loaded.forEach((subdoc: Y.Doc) => {
      console.warn("add sub docs:" + subdoc.guid);

      // Add event listeners before adding to provider
      // @ts-ignore
      subdoc.on("update", (update: Uint8Array, origin: any) => {
        console.log("Subdoc update received:", {
          docId: subdoc.guid,
          updateLength: update.length,
          origin: origin,
        });
      });

      const subDocText = subdoc.getText();
      subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
        console.log("Subdoc text changed:", {
          docId: subdoc.guid,
          delta: event.delta,
          currentText: subDocText.toString(),
        });
        updateEditor(editorView, tr, event, subdoc);
      });

      // @ts-ignore
      subdoc.on("synced", () => {
        console.log("Subdoc synced:", {
          docId: subdoc.guid,
          content: subDocText.toString(),
        });
      });

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
    initialSub(editorAttr.docId, rootYdoc);
  }
  // load the initial subdocument
  let initDoc: any = rootYdoc.getMap().get(editorAttr.docId);
  if (initDoc) {
    console.warn("load initial doc:" + editorAttr.docId);
    initDoc.load();

    // Add event listeners before loading
    initDoc.on("update", (update: Uint8Array, origin: any) => {
      console.log("Initial doc update received:", {
        docId: initDoc.guid,
        updateLength: update.length,
        origin: origin,
      });
    });

    initDoc.on("synced", () => {
      const subDocText = initDoc.getText();
      console.warn(initDoc.guid + ",synced:" + subDocText);

      // Add observer for the initial document
      subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
        console.log("Initial doc text changed:", {
          docId: initDoc.guid,
          delta: event.delta,
          currentText: subDocText.toString(),
        });
        updateEditor(editorView, tr, event, initDoc);
      });
    });
  } else {
    console.error("did not found initial doc:" + editorAttr.docId);
  }

  // @ts-ignore
  rootYdoc.on("update", (update: any, origin: any) => {
    console.log("Root doc update:", {
      updateLength: update.length,
      origin: origin,
    });
    const doc = new Y.Doc();
    showDocContent(update, doc);
  });

  const showDocContent = (updateVal: Uint8Array, ydoc: Y.Doc) => {
    const decoder = decoding.createDecoder(updateVal);
    Y.transact(ydoc, (transaction) => {
      transaction.local = false;
      const doc = transaction.doc;
      let structDecoder = new Y.UpdateDecoderV1(decoder);
      const ss = Y.readClientsStructRefs(structDecoder, doc);
      console.log("refs:", ss);
    });
    const ytext = ydoc.getText();
    console.log("ytext:", ytext.toString());
  };

  const texEditorState: EditorState = EditorState.create({
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

const initialSub = (fileId: string, rootDoc: Y.Doc) => {
  if (fileId) {
    const folder = rootDoc.getMap();
    const subDoc: Y.Doc = new Y.Doc();
    subDoc.guid = fileId;
    folder.set(fileId, subDoc);
  }
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
  editorView.dispatch({
    // @ts-ignore
    changes,
    annotations: [ySyncAnnotation.of(conf)],
  });
};
