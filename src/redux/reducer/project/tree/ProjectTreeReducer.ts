import { AppState } from "@/redux/types/AppState";
import { SearchResult } from "@/model/proj/search/SearchResult";
import { TexFileModel } from "@/model/file/TexFileModel.js";

const initState: AppState["projTree"] = {
  hits: [] as SearchResult[],
  curHistoryFile: {} as TexFileModel
};

const ProjectTreeReducer = (state = initState, action: any) => {
  switch (action.type) {
    case "PROJ_SEARCH":
      return {
        ...state,
        hits: action.data,
      };
    case "CUR_HISTORY_FILE":
      return {
        ...state,
        curHistoryFile: action.data,
      };
    default:
      break;
  }
  return state;
};

export default ProjectTreeReducer;
