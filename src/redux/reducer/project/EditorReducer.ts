import { AppState } from "@/redux/types/AppState";
import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider";
import * as Y from "rdyjs";

const initState: AppState["projEditor"] = {
  editorView: {} as EditorView,
  texEditorSocketIOWs: {} as SocketIOClientProvider,
  curYDoc: {} as Y.Doc,
  connState: "",
};

const EditorReducer = (state = initState, action: any) => {
  switch (action.type) {
    case "INITIAL_EDITOR":
      return {
        ...state,
        editorView: action.data,
      };
    case "INITIAL_WS":
      return {
        ...state,
        texEditorWs: action.data,
      };
    case "INITIAL_SOCKETIO_WS":
      return {
        ...state,
        texEditorSocketIOWs: action.data,
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
