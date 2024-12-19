import { AppState } from "@/redux/types/AppState";

const initState: AppState["preview"] = {
  curPage: -1,
  fullscreenFlag: false,
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
    default:
      break;
  }
  return state;
};

export default PreviewReducer;
