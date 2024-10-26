import { AppState } from "@/redux/types/AppState";
import { EditorView } from "@codemirror/view";
import { WebsocketProvider } from "rdy-websocket";
import * as Y from "yjs";

const initState: AppState["projEditor"] = {
  editor: {} as EditorView,
  texEditorWs: {} as WebsocketProvider,
  curYDoc: {} as Y.Doc,
  connState: "",
};

const EditorReducer = (state = initState, action: any) => {
  switch (action.type) {
    case "INITIAL_EDITOR":
      return {
        ...state,
        editor: action.data,
      };
    case "INITIAL_WS":
      return {
        ...state,
        texEditorWs: action.data,
      };
    case "SET_CUR_YDOC":
      return {
        ...state,
        curYDoc: action.data,
      };
    case "SET_WS_CON_STATE":
      return {
        ...state,
        connState: action.data,
      };
    default:
      break;
  }
  return state;
};

export default EditorReducer;
