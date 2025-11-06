import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast";
import { SingleClientProvider } from "texhub-broadcast";
import { DocMeta } from "texhub-broadcast";
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
  setCurSubDoc,
  setEditorInstance,
  setSocketIOProvider,
  setWsConnState,
} from "../project/editor/EditorService";
import { ManagerOptions, SocketOptions } from "socket.io-client";
import { getAccessToken } from "@/component/common/cache/Cache";
import { SubDocEventProps } from "@/model/props/yjs/subdoc/SubDocEventProps.js";
// @ts-ignore
import { DocOpts } from "rdyjs/dist/src/utils/Doc.mjs";
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

var ydoc: any;

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
    console.log("WebSocket provider synced");
    if (loadFile) {
      // when run this first doc init, there contains 2 subdoc
      // still did not found where to add this 2 subdoc
      initialFisrtSubDoc(loadFile);
    }
  });
  // Add connection status listener
  // @ts-ignore
  wsProvider.on("connectionStatus", (status: any) => {
    console.log("WebSocket provider connection status:", status);
  });
  setSocketIOProvider(wsProvider);
}

const initialFisrtSubDoc = (file: TexFileModel) => {
  let firstSubDoc = new Y.Doc();
  firstSubDoc.guid = file.file_id;
  let docMetadata: DocMeta = {
    name: file.name,
    id: file.id,
    src: "initialFisrtSubDoc",
  };
  firstSubDoc.meta = docMetadata;
  // record initial first doc via logger wrapper (console + indexeddb)
  logger.info("initial first doc", { file });
  setCurSubDoc(firstSubDoc);
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
    // handleLoadedSubDoc(props.loaded);
  }
};

const handleLoadedSubDoc = (subdocs: Set<Y.Doc>) => {
  subdocs.forEach((subdoc: Y.Doc) => {
    let subDocText = subdoc.getText(subdoc.guid);
    let subDocTextString = subDocText.toString();
    if (!subDocTextString || subDocTextString.length === 0) {
      console.error("subdoc text is null:" + subdoc.guid);
      return;
    }
    console.log("trigger subdoc loaded to fill content:" + subdoc.guid);
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
