import { EditorView } from "@codemirror/view";
import { WebsocketProvider } from "rdy-websocket";

export type editorAction =
  | setCollarEditorAction
  | setCollarEditorWsAction
  | setYDocAction
  | setWsConnStateAction;

export enum CollarEditorActionType {
  INITIAL_EDITOR,
  INITIAL_WS,
  SET_CUR_YDOC,
  SET_WS_CON_STATE,
}

export interface setCollarEditorAction {
  type: CollarEditorActionType.INITIAL_EDITOR;
  data: EditorView;
}

export interface setCollarEditorWsAction {
  type: CollarEditorActionType.INITIAL_WS;
  data: WebsocketProvider;
}

export interface setYDocAction {
  type: CollarEditorActionType.SET_CUR_YDOC;
  data: any;
}

export interface setWsConnStateAction {
  type: CollarEditorActionType.SET_WS_CON_STATE;
  data: any;
}