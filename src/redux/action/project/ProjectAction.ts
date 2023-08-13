export type projectAction = saveDocAction | getDocListAction | compileProjAction;

export enum ProjectActionType {
    CREATE_DOC,
    GET_PROJ_LIST,
    DELETE_PROJ,
    CLEAR_CURRENT_EDU,
    COMPILE_PROJ
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