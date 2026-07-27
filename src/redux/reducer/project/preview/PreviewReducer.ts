import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["preview"] = {
  curPage: 0,
  fullscreenFlag: false,
  compileResultType: CompileResultType.SUCCESS,
  pdfOutline: [],
  outlineNavRequest: null,
  activeOutline: { ancestorKeys: [] },
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
      return {
        ...state,
        compileResultType: action.data,
      };
    case "SET_PDF_OUTLINE":
      return {
        ...state,
        pdfOutline: action.data ?? [],
        activeOutline: { ancestorKeys: [] },
      };
    case "REQUEST_OUTLINE_NAV":
      return {
        ...state,
        outlineNavRequest: action.data,
      };
    case "SET_ACTIVE_OUTLINE":
      return {
        ...state,
        activeOutline: action.data ?? { ancestorKeys: [] },
      };
    default:
      break;
  }
  return state;
};

export default PreviewReducer;
