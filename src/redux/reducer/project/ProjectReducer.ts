import { CompileResult } from "@/model/proj/CompileResult";
import { LatestCompile } from "@/model/proj/LatestCompile";
import { AppState } from "@/redux/types/AppState";
import { JoinResult } from "@/model/proj/JoinResult";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { SearchResult } from "@/model/proj/search/SearchResult";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";

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
    projInfo: {} as ProjInfo,
    compileStatus: {} as CompileStatus,
    projAttr: {
        pdfScale: 1
    } as ProjAttribute,
    pdfFocus: [] as PdfPosition[],
    srcFocus: [] as SrcPosition[],
    projConf: {} as ProjConf,
    hits: [] as SearchResult[],
    activeShare: false,
    projHistories: [] as ProjHisotry[]
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
        case "SET_COMPILE_STATUS":
            return {
                ...state,
                compileStatus: action.data
            };
        case "PROJ_ATTR":
            const newObject: ProjAttribute = { ...state.projAttr, ...action.data };
            return {
                ...state,
                projAttr: newObject
            };
        case "GET_PDF_POSITION":
            return {
                ...state,
                pdfFocus: action.data
            };
        case "GET_SRC_POSITION":
            return {
                ...state,
                srcFocus: action.data
            };
        case "CHANGE_PROJ_CONF":
            return {
                ...state,
                projConf: action.data
            };
        case "PROJ_SEARCH":
            return {
                ...state,
                hits: action.data
            };
        case "SHARE_PROJ":
            let newActiveShare = !state.activeShare;
            return {
                ...state,
                activeShare: newActiveShare
            };
        case "PROJ_HISTORY":
            return {
                ...state,
                projHistories: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectReducer;