import { CollarEditorActionType } from "@/redux/action/project/editor/EditorAction";
import store from "@/redux/store/store";
import { EditorView } from "codemirror";
import { XHRClient } from "rd-component";
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

export function setWsConnState(state: string) {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_WS_CON_STATE];
  return XHRClient.dispathAction(state, actionTypeString, store);
}

export function setEditorText(text: string) {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_EDITOR_TEXT];
  return XHRClient.dispathAction(text, actionTypeString, store);
}