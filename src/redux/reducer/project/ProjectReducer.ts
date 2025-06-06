import { RemoteCompileResult } from "@/model/proj/RemoteCompileResult";
import { LatestCompile } from "@/model/proj/LatestCompile";
import { AppState } from "@/redux/types/AppState";
import { JoinResult } from "@/model/proj/JoinResult";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { ProjHisotry as ProjHistory } from "@/model/proj/history/ProjHistory";
import { TexProjects } from "@/model/proj/TexProjects";

const initState: AppState["proj"] = {
    projList: {} as TexProjects,
    folderProjList: [],
    remoteCompileResult: {} as RemoteCompileResult,
    joinResult: {} as JoinResult,
    latestComp: {} as LatestCompile,
    texPdfUrl: "",
    logText: "",
    streamLogText: "",
    endSignal: "",
    queue: {} as CompileQueue,
    tabName: "",
    projInfo: {} as ProjInfo,
    compileStatus: {} as CompileStatus,
    projAttr: {
        pdfScale: 1
    } as PreviewPdfAttribute,
    pdfFocus: [] as PdfPosition[],
    srcFocus: [] as SrcPosition[],
    projConf: {} as ProjConf,
    activeShare: false,
    projHistories: [] as ProjHistory[],
    insertContext: "",
    projHisPage: {
        pagination: {
            total: 0,
            pageNum: 0,
            pageSize: 0
        }
    },
    replaceContext: "",
    curHistory: {} as ProjHistory
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
                texPdfUrl: action.data
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
        case "SET_COMPILE_RESULT":
            return {
                ...state,
                compileResult: action.data
            };
        case "PROJ_ATTR":
            const newObject: PreviewPdfAttribute = { ...state.projAttr, ...action.data };
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
        case "PROJ_HISTORY_PAGE":
            return {
                ...state,
                projHisPage: action.data
            };
        case "GET_FOLDER_PROJ":
            return {
                ...state,
                folderProjList: action.data
            };
        case "EDITOR_INSERT_TEXT":
            return {
                ...state,
                insertContext: action.data
            };
        case "EDITOR_REPLACE_TEXT":
            return {
                ...state,
                replaceContext: action.data
            };
        case "PROJ_HISTORY_DETAIL":
            return {
                ...state,
                curHistory: action.data
            };
        
        default:
            break;
    }
    return state;
};

export default ProjectReducer;