import { AppState } from "@/redux/types/AppState";
import { EditorView } from "@codemirror/view";
import { WebsocketProvider } from "rdy-websocket";

const initState: AppState["editor"] = {
  editor: {} as EditorView,
  ws: {} as WebsocketProvider
};

const ProjectReducer = (state = initState, action: any) => {
  switch (action.type) {
    case "INITIAL_EDITOR":
      return {
        ...state,
        editor: action.data,
      };
    case "INITIAL_WS":
      return {
        ...state,
        ws: action.data,
      };
    default:
      break;
  }
  return state;
};

export default ProjectReducer;
