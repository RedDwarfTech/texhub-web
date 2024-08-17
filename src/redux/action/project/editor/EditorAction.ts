import { EditorView } from "@codemirror/view";
import { WebsocketProvider } from "rdy-websocket";

export type editorAction = setCollarEditorAction ;

export enum CollarEditorActionType {
    INITIAL_EDITOR,
    INITIAL_WS
}

export interface setCollarEditorAction {
    type: CollarEditorActionType.INITIAL_EDITOR;
    data: EditorView;
}

export interface setCollarEditorWsAction {
    type: CollarEditorActionType.INITIAL_WS;
    data: WebsocketProvider;
}