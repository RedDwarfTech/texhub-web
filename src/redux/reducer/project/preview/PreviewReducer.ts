import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["preview"] = {
  curPage: -1,
  fullscreenFlag: false,
  compileResultType: CompileResultType.SUCCESS
};

const PreviewReducer = (state = initState, action: any) => {
  switch (action.type) {
    case "SET_CUR_PAGE":
      return {
        ...state,
        curPage: action.data,
      };
    case "SET_FULLSCREEN_FLAG":
      return {
        ...state,
        fullscreenFlag: action.data,
      };
    case "SET_COMPILE_RESULT_TYPE":
      debugger;
      return {
        ...state,
        compileResultType: action.data,
      };
    default:
      break;
  }
  return state;
};

export default PreviewReducer;
