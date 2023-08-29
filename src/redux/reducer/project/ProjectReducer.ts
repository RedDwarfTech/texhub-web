import { CompileResult } from "@/model/prj/CompileResult";
import { LatestCompile } from "@/model/prj/LatestCompile";
import { AppState } from "@/redux/types/AppState";
import { JoinResult } from "@/model/prj/JoinResult";

const initState: AppState["proj"] = {
    projList: [],
    compileResult: {} as CompileResult,
    joinResult: {} as JoinResult,
    latestComp: {} as LatestCompile,
    pdfUrl: ""
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
        case "JOIN_PROJ":
            return {
                ...state,
                joinResult: action.data
            };
        case "RENDER_PDF":
            return {
                ...state,
                pdfUrl: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectReducer;