import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";

export type projectAction = saveDocAction | getDocListAction | compileProjAction | getLatestCompileAction | renderLogAction | clearCompLogAction | addQueueCompileAction | getCompQueueStatusAction | texCompEndAction | getProjInfoAction | delProjInfoAction | uploadProjFileAction | getHisPageAction;

export enum ProjectActionType {
    CREATE_DOC,
    CREATE_FOLDER,
    GET_PROJ_LIST,
    GET_FOLDER_PROJ,
    GET_PROJ_INFO,
    DELETE_PROJ_INFO,
    DELETE_PROJ,
    RENAME_PROJ,
    RENAME_FOLDER,
    MOVE_PROJ,
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
    UPLOAD_PROJ,
    IMPORT_GITHUB_PROJ,
    PROJ_ATTR,
    GET_PDF_POSITION,
    GET_SRC_POSITION,
    CHANGE_PROJ_CONF,
    PROJ_HISTORY,
    PROJ_HISTORY_DETAIL,
    PROJ_HISTORY_PAGE,
    SHARE_PROJ,
    ARCHIVE_PROJ,
    TRASH_PROJ,
    COPY_PROJ,
    DOWNLOAD_PROJ,
    EDITOR_INSERT_TEXT,
    EDITOR_REPLACE_TEXT
}

export interface saveDocAction {
    type: ProjectActionType.CREATE_DOC;
    data: any;
}

export interface getDocListAction {
    type: ProjectActionType.GET_PROJ_LIST;
    data: any;
}

export interface getHisPageAction {
    type: ProjectActionType.PROJ_HISTORY_PAGE;
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

export interface uploadProjAction {
    type: ProjectActionType.UPLOAD_PROJ;
    data: CompileStatus;
}

export interface setProjAttrAction {
    type: ProjectActionType.PROJ_ATTR;
    data: PreviewPdfAttribute;
}

export interface getPdfPositionAction {
    type: ProjectActionType.GET_PDF_POSITION;
    data: any;
}

export interface changeProjConfAction {
    type: ProjectActionType.CHANGE_PROJ_CONF;
    data: any;
}

export interface projShareAction {
    type: ProjectActionType.SHARE_PROJ;
    data: any;
}

export interface projHistoryAction {
    type: ProjectActionType.PROJ_HISTORY;
    data: any;
}

export interface renameProjAction {
    type: ProjectActionType.RENAME_PROJ;
    data: any;
}

export interface archiveProjAction {
    type: ProjectActionType.ARCHIVE_PROJ;
    data: any;
}

export interface downloadProjAction {
    type: ProjectActionType.DOWNLOAD_PROJ;
    data: any;
}

export interface moveProjAction {
    type: ProjectActionType.MOVE_PROJ;
    data: any;
}

export interface getFolderProjAction {
    type: ProjectActionType.GET_FOLDER_PROJ;
    data: any;
}

export interface copyProjAction {
    type: ProjectActionType.COPY_PROJ;
    data: any;
}

export interface renameFolderAction {
    type: ProjectActionType.RENAME_FOLDER;
    data: any;
}

export interface insertTextAction {
    type: ProjectActionType.EDITOR_INSERT_TEXT;
    data: any;
}

export interface replaceTextAction {
    type: ProjectActionType.EDITOR_REPLACE_TEXT;
    data: any;
}
