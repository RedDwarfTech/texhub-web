import { AppState } from "@/redux/types/AppState";
import { SearchResult } from "@/model/proj/search/SearchResult";

const initState: AppState["projTree"] = {
    hits: [] as SearchResult[],
};

const ProjectTreeReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "PROJ_SEARCH":
            return {
                ...state,
                hits: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectTreeReducer;