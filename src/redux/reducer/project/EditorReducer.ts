import { AppState } from "@/redux/types/AppState";
import { EditorView } from "@codemirror/view";
//import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider";
import * as Y from "rdyjs";

const initState: AppState["projEditor"] = {
  editorView: {} as EditorView,
  texEditorSocketIOWs: {} as any,
  curRootYDoc: {} as Y.Doc,
  curSubYDoc: {} as Y.Doc,
  wsConnState: "",
  editorText: "",
};

const EditorReducer = (state = initState, action: any) => {
  switch (action.type) {
    case "INITIAL_EDITOR":
      return {
        ...state,
        editorView: action.data,
      };
    case "CLRAR_EDITOR":
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
    case "CLEAR_SOCKETIO_WS":
      return {
        ...state,
        texEditorSocketIOWs: action.data,
      };
    case "SET_CUR_ROOT_YDOC":
      return {
        ...state,
        curRootYDoc: action.data,
      };
    case "SET_CUR_SUB_YDOC":
      return {
        ...state,
        curSubYDoc: action.data,
      };
    case "SET_WS_CON_STATE":
      return {
        ...state,
        wsConnState: action.data,
      };
    case "SET_EDITOR_TEXT":
      return {
        ...state,
        editorText: action.data,
      };
    default:
      break;
  }
  return state;
};

export default EditorReducer;
