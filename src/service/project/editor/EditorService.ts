import { CollarEditorActionType } from "@/redux/action/project/editor/EditorAction";
import store from "@/redux/store/store";
import { EditorView } from "codemirror";
import { XHRClient } from "rd-component";
import { WebsocketProvider } from "rdy-websocket";

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
