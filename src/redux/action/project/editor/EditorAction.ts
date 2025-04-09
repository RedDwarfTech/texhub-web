import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider";

export type editorAction =
  | setCollarEditorAction
  | setYDocAction
  | setCollarEditorWsSocketIOAction
  | setWsConnStateAction;

export enum CollarEditorActionType {
  INITIAL_EDITOR,
  INITIAL_WS,
  INITIAL_SOCKETIO_WS,
  SET_CUR_YDOC,
  SET_WS_CON_STATE,
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
  type: CollarEditorActionType.SET_CUR_YDOC;
  data: any;
}

export interface setWsConnStateAction {
  type: CollarEditorActionType.SET_WS_CON_STATE;
  data: any;
}