import { EditorView } from "@codemirror/view";
import * as Y from "rdyjs";

export type editorAction =
  | setCollarEditorAction
  | setYDocAction
  | setCollarEditorWsSocketIOAction
  | setWsConnStateAction
  | clearCollarEditorAction;

export enum CollarEditorActionType {
  INITIAL_EDITOR,
  CLRAR_EDITOR,
  INITIAL_WS,
  INITIAL_SOCKETIO_WS,
  CLEAR_SOCKETIO_WS,
  SET_CUR_ROOT_YDOC,
  SET_CUR_SUB_YDOC,
  SET_WS_CON_STATE
}

export interface setCollarEditorAction {
  type: CollarEditorActionType.INITIAL_EDITOR;
  data: EditorView;
}

export interface clearCollarEditorAction {
  type: CollarEditorActionType.CLRAR_EDITOR;
  data: EditorView;
}

export interface clearCollarEditorWsSocketIOAction {
  type: CollarEditorActionType.CLEAR_SOCKETIO_WS;
  data: EditorView;
}

export interface setCollarEditorWsSocketIOAction {
  type: CollarEditorActionType.INITIAL_SOCKETIO_WS;
  data: any;
}

export interface setYDocAction {
  type: CollarEditorActionType.SET_CUR_ROOT_YDOC;
  data: Y.Doc;
}

export interface setSubYDocAction {
  type: CollarEditorActionType.SET_CUR_SUB_YDOC;
  data: Y.Doc;
}

export interface setWsConnStateAction {
  type: CollarEditorActionType.SET_WS_CON_STATE;
  data: any;
}
