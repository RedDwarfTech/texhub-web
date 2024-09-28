export type previewAction = setCurPageAction ;

export enum PreviewActionType {
    SET_CUR_PAGE,
    SET_CUR_SCALE,
    SET_CUR_SCALE_FULL_SCREEN,
}

export interface setCurPageAction {
    type: PreviewActionType.SET_CUR_PAGE;
    data: any;
}

export interface setCurScaleAction {
    type: PreviewActionType.SET_CUR_SCALE;
    data: any;
}