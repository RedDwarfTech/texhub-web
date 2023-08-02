export type docAction = saveDocAction | getDocListAction;

export enum DocActionType {
    SAVE_EDU,
    GET_DOC_LIST,
    DEL_EDU_ITEM,
    CLEAR_CURRENT_EDU
}

export interface saveDocAction {
    type: DocActionType.SAVE_EDU;
    data: any;
}

export interface getDocListAction {
    type: DocActionType.GET_DOC_LIST;
    data: any;
}