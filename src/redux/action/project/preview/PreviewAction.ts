export type previewAction = setCurPageAction ;

export enum PreviewActionType {
    SET_CUR_PAGE,
}

export interface setCurPageAction {
    type: PreviewActionType.SET_CUR_PAGE;
    data: any;
}