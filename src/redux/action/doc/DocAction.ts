export type docAction = saveDocAction | getDocListAction;

export enum DocActionType {
    CREATE_DOC,
    GET_DOC_LIST,
    DEL_EDU_ITEM,
    CLEAR_CURRENT_EDU
}

export interface saveDocAction {
    type: DocActionType.CREATE_DOC;
    data: any;
}

export interface getDocListAction {
    type: DocActionType.GET_DOC_LIST;
    data: any;
}