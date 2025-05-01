import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider";
import * as Y from 'rdyjs';

export type editorAction =
  | setCollarEditorAction
  | setYDocAction
  | setCollarEditorWsSocketIOAction
  | setWsConnStateAction;

export enum CollarEditorActionType {
  INITIAL_EDITOR,
  INITIAL_WS,
  INITIAL_SOCKETIO_WS,
  SET_CUR_ROOT_YDOC,
  SET_CUR_SUB_YDOC,
  SET_WS_CON_STATE,
  SET_EDITOR_TEXT,
}

export interface setCollarEditorAction {
  type: CollarEditorActionType.INITIAL_EDITOR;
  data: EditorView;
}

export interface setCollarEditorWsSocketIOAction {
  type: CollarEditorActionType.INITIAL_SOCKETIO_WS;
  data: SocketIOClientProvider;
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

export interface setEditorTextAction {
  type: CollarEditorActionType.SET_EDITOR_TEXT;
  data: any;
}
