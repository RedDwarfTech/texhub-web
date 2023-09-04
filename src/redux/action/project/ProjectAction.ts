export type projectAction = saveDocAction | getDocListAction | compileProjAction | getLatestCompileAction | renderLogAction | clearCompLogAction;

export enum ProjectActionType {
    CREATE_DOC,
    GET_PROJ_LIST,
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
    TEX_COMP_END
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
