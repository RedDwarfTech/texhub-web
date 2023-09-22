import { CompileStatus } from "@/model/prj/compile/CompileStatus";
import { ProjAttribute } from "@/model/prj/config/ProjAttribute";

export type projectAction = saveDocAction | getDocListAction | compileProjAction | getLatestCompileAction | renderLogAction | clearCompLogAction | addQueueCompileAction | getCompQueueStatusAction | texCompEndAction | getProjInfoAction | delProjInfoAction | uploadProjFileAction;

export enum ProjectActionType {
    CREATE_DOC,
    GET_PROJ_LIST,
    GET_PROJ_INFO,
    DELETE_PROJ_INFO,
    DELETE_PROJ,
    CLEAR_CURRENT_EDU,
    COMPILE_PROJ,
    LATEST_COMPILE,
    JOIN_PROJ,
    COMPILE_PROJ_STREAM,
    RENDER_PDF,
    GET_TEMP_AUTH_CODE,
    APPEND_LOG,
    CLEAR_COMP_LOG,
    TEX_COMP_END,
    ADD_QUEUE_COMPILE,
    GET_COMP_QUEUE_STATUS,
    SHOW_PREVIEW_TAB,
    GET_COMPILE_LOG,
    SET_COMPILE_STATUS,
    UPLOAD_PROJ_FILE,
    PROJ_ATTR
}

export interface saveDocAction {
    type: ProjectActionType.CREATE_DOC;
    data: any;
}

export interface getDocListAction {
    type: ProjectActionType.GET_PROJ_LIST;
    data: any;
}

export interface compileProjAction {
    type: ProjectActionType.COMPILE_PROJ;
    data: any;
}

export interface getLatestCompileAction {
    type: ProjectActionType.LATEST_COMPILE;
    data: any;
}

export interface joinProjectAction {
    type: ProjectActionType.JOIN_PROJ;
    data: any;
}

export interface compileProjectStreamAction {
    type: ProjectActionType.COMPILE_PROJ_STREAM;
    data: any;
}

export interface renderPdfAction {
    type: ProjectActionType.RENDER_PDF;
    data: any;
}

export interface renderLogAction {
    type: ProjectActionType.APPEND_LOG;
    data: string;
}

export interface clearCompLogAction {
    type: ProjectActionType.CLEAR_COMP_LOG;
    data: string;
}

export interface addQueueCompileAction {
    type: ProjectActionType.ADD_QUEUE_COMPILE;
    data: string;
}

export interface getCompQueueStatusAction {
    type: ProjectActionType.GET_COMP_QUEUE_STATUS;
    data: string;
}

export interface showPreviewTabAction {
    type: ProjectActionType.SHOW_PREVIEW_TAB;
    data: string;
}

export interface getCompileLogAction {
    type: ProjectActionType.GET_COMPILE_LOG;
    data: string;
}

export interface texCompEndAction {
    type: ProjectActionType.TEX_COMP_END;
    data: string;
}

export interface getProjInfoAction {
    type: ProjectActionType.GET_PROJ_INFO;
    data: string;
}

export interface delProjInfoAction {
    type: ProjectActionType.DELETE_PROJ_INFO;
    data: string;
}

export interface setCompileStatusAction {
    type: ProjectActionType.SET_COMPILE_STATUS;
    data: CompileStatus;
}

export interface uploadProjFileAction {
    type: ProjectActionType.UPLOAD_PROJ_FILE;
    data: CompileStatus;
}

export interface setProjAttrAction {
    type: ProjectActionType.PROJ_ATTR;
    data: ProjAttribute;
}