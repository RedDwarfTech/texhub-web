export type previewAction = setCurPageAction ;

export enum PreviewActionType {
    SET_CUR_PAGE,
    SET_CUR_SCALE,
    SET_CUR_SCALE_FULL_SCREEN,
    SET_FULLSCREEN_FLAG,
}

export interface setCurPageAction {
    type: PreviewActionType.SET_CUR_PAGE;
    data: any;
}

export interface setCurScaleAction {
    type: PreviewActionType.SET_CUR_SCALE;
    data: any;
}

export interface setFullscreenAction {
    type: PreviewActionType.SET_FULLSCREEN_FLAG;
    data: any;
}