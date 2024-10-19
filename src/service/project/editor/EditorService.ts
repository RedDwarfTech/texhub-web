import { CollarEditorActionType } from "@/redux/action/project/editor/EditorAction";
import store from "@/redux/store/store";
import { EditorView } from "codemirror";
import { XHRClient } from "rd-component";
import { WebsocketProvider } from "rdy-websocket";
import * as Y from 'yjs';

export function setEditorInstance(view: EditorView) {
  const actionTypeString: string =
    CollarEditorActionType[CollarEditorActionType.INITIAL_EDITOR];
  return XHRClient.dispathAction(view, actionTypeString, store);
}

export function setWebsocketProvider(ws: WebsocketProvider) {
  const actionTypeString: string =
    CollarEditorActionType[CollarEditorActionType.INITIAL_WS];
  return XHRClient.dispathAction(ws, actionTypeString, store);
}

export function setCurYDoc(ydoc: Y.Doc) {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_CUR_YDOC];
  return XHRClient.dispathAction(ydoc, actionTypeString, store);
}

export function setWsConnState(state: string) {
  const actionTypeString: string = CollarEditorActionType[CollarEditorActionType.SET_WS_CON_STATE];
  return XHRClient.dispathAction(state, actionTypeString, store);
}