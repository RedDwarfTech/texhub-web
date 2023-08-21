import { CompileResult } from "@/model/doc/CompileResult";
import { LatestCompile } from "@/model/doc/LatestCompile";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["proj"] = {
    projList: [],
    compileResult: {} as CompileResult,
    latestComp: {} as LatestCompile
};

const ProjectReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_PROJ_LIST":
            return {
                ...state,
                projList: action.data
            };
        case "COMPILE_PROJ":
            return {
                ...state,
                compileResult: action.data
            };
        case "LATEST_COMPILE":
            return {
                ...state,
                latestComp: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectReducer;