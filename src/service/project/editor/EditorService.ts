import { CollarEditorActionType } from "@/redux/action/project/editor/EditorAction";
import store from "@/redux/store/store";
import { EditorView } from "codemirror";
import { XHRClient } from "rd-component";
import { BaseMethods } from "rdjs-wheel";
import * as Y from 'rdyjs';

export function setEditorInstance(view: EditorView) {
  const actionTypeString: string =
    CollarEditorActionType[CollarEditorActionType.INITIAL_EDITOR];
  return XHRClient.dispathAction(view, actionTypeString, store);
}

export function clearEditorInstance() {
  const actionTypeString: string =
    CollarEditorActionType[CollarEditorActionType.CLRAR_EDITOR];
  return XHRClient.dispathAction(null, actionTypeString, store);
}

export function setSocketIOProvider(ws: any) {
  const actionTypeString: string =
    CollarEditorActionType[CollarEditorActionType.INITIAL_SOCKETIO_WS];
  return XHRClient.dispathAction(ws, actionTypeString, store);
}

export function clearSocketIOProvider() {
  const actionTypeString: string =
    CollarEditorActionType[CollarEditorActionType.CLEAR_SOCKETIO_WS];
  return XHRClient.dispathAction(null, actionTypeString, store);
}

export function clearCurRootYDoc() {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_CUR_ROOT_YDOC];
  return XHRClient.dispathAction(null, actionTypeString, store);
}

export function setCurRootYDoc(ydoc: Y.Doc) {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_CUR_ROOT_YDOC];
  return XHRClient.dispathAction(ydoc, actionTypeString, store);
}

export function clearCurSubDoc() {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_CUR_SUB_YDOC];
  return XHRClient.dispathAction(null, actionTypeString, store);
}

export function setCurSubDoc(ydoc: Y.Doc) {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_CUR_SUB_YDOC];
  return XHRClient.dispathAction(ydoc, actionTypeString, store);
}

/** 当 subdoc 引用未变时强制触发编辑器重建 */
export function forceSetCurSubDoc(ydoc: Y.Doc) {
  const current = store.getState().projEditor.curSubYDoc;
  const isSameRef =
    current &&
    !BaseMethods.isNull(current) &&
    current.guid === ydoc.guid &&
    current === ydoc;
  if (isSameRef) {
    clearCurSubDoc();
    queueMicrotask(() => setCurSubDoc(ydoc));
    return;
  }
  setCurSubDoc(ydoc);
}

export function isWsProviderReady(ws: unknown): boolean {
  if (!ws || typeof ws !== "object") {
    return false;
  }
  const provider = ws as { ws?: { connected?: boolean } };
  return !!provider.ws;
}

export function isEditorSyncedWithFile(fileId: string): boolean {
  const { curSubYDoc, editorView } = store.getState().projEditor;
  if (BaseMethods.isNull(curSubYDoc) || !curSubYDoc?.guid) {
    return false;
  }
  if (curSubYDoc.guid !== fileId) {
    return false;
  }
  if (BaseMethods.isNull(editorView) || !(editorView as EditorView).state) {
    return false;
  }
  return true;
}

export function setWsConnState(state: string) {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_WS_CON_STATE];
  return XHRClient.dispathAction(state, actionTypeString, store);
}