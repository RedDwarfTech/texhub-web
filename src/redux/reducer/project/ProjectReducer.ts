import { CompileResult } from "@/model/prj/CompileResult";
import { LatestCompile } from "@/model/prj/LatestCompile";
import { AppState } from "@/redux/types/AppState";
import { JoinResult } from "@/model/prj/JoinResult";
import { CompileQueue } from "@/model/prj/CompileQueue";
import { ProjInfo } from "@/model/prj/ProjInfo";

const initState: AppState["proj"] = {
    projList: [],
    compileResult: {} as CompileResult,
    joinResult: {} as JoinResult,
    latestComp: {} as LatestCompile,
    pdfUrl: "",
    logText: "",
    streamLogText: "",
    endSignal: "",
    queue: {} as CompileQueue,
    tabName: "",
    projInfo: {} as ProjInfo
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
        case "APPEND_LOG":
            return {
                ...state,
                streamLogText: action.data
            };
        case "CLEAR_COMP_LOG":
            return {
                ...state,
                logText: action.data,
                streamLogText: action.data
            };
        case "TEX_COMP_END":
            return {
                ...state,
                endSignal: action.data
            };
        case "ADD_QUEUE_COMPILE":
            return {
                ...state,
                queue: action.data
            };  
        case "GET_COMP_QUEUE_STATUS":
            return {
                ...state,
                queue: action.data
            };
        case "SHOW_PREVIEW_TAB":
            return {
                ...state,
                tabName: action.data
            };
        case "GET_COMPILE_LOG":
            return {
                ...state,
                logText: action.data
            };
        case "GET_PROJ_INFO":
            return {
                ...state,
                projInfo: action.data
            };
        case "DELETE_PROJ_INFO":
            return {
                ...state,
                projInfo: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectReducer;