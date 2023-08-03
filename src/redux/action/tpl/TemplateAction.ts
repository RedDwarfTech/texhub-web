export type docAction = saveTplAction | getTplListAction;

export enum TemplateActionType {
    CREATE_DOC,
    GET_TPL_LIST,
    DEL_EDU_ITEM,
    CLEAR_CURRENT_EDU
}

export interface saveTplAction {
    type: TemplateActionType.CREATE_DOC;
    data: any;
}

export interface getTplListAction {
    type: TemplateActionType.GET_TPL_LIST;
    data: any;
}