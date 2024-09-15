import { AppState } from "@/redux/types/AppState";

const initState: AppState["preview"] = {
  curPage: -1,
};

const PreviewReducer = (state = initState, action: any) => {
  switch (action.type) {
    case "SET_CUR_PAGE":
      debugger;
      return {
        ...state,
        curPage: action.data,
      };
    default:
      break;
  }
  return state;
};

export default PreviewReducer;
