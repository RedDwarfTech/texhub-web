import { EditorView } from "@codemirror/view";
import * as Y from "rdyjs";
// @ts-ignore
import * as random from "rdlib0/random";
import { createExtensions } from "@/component/common/editor/foundation/extensions/extensions";
import { Compartment, EditorState } from "@codemirror/state";
import {
  BaseMethods,
  UserModel,
} from "rdjs-wheel";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { RefObject } from "react";
import { projHasFile } from "../project/ProjectService";
import { Metadata } from "@/component/common/editor/foundation/extensions/language";
import {
  setCurRootYDoc,
  setEditorInstance,
} from "../project/editor/EditorService";

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

const doWsConn = (ydoc: any, editorAttr: EditorAttr): any => {
  let contains = projHasFile(editorAttr.docId, editorAttr.projectId);
  if (!contains) {
    console.error("initial the file do not belong the project");
  }
  const wsProvider = null;
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
  legacyWs: any | undefined
) {
  if (legacyWs) {
    // close the legacy websocket to avoid 1006 disconnect on the server side
    legacyWs.ws?.close(1000, "client send close signal");
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
  setCurRootYDoc(ydoc);
  const ytext: Y.Text = ydoc.getText(editorAttr.docId);
  const undoManager = new Y.UndoManager(ytext);
  let wsProvider: any = doWsConn(ydoc, editorAttr);
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
}