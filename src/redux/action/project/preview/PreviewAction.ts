import { CompileResultType } from "@/model/proj/compile/CompileResultType";

export type previewAction = setCurPageAction;

export enum PreviewActionType {
  SET_CUR_PAGE,
  SET_CUR_SCALE,
  SET_CUR_SCALE_FULL_SCREEN,
  SET_FULLSCREEN_FLAG,
  SET_COMPILE_RESULT_TYPE,
  SET_PDF_OUTLINE,
  REQUEST_OUTLINE_NAV,
  SET_ACTIVE_OUTLINE,
}

export interface setCompileResultTypeAction {
  type: PreviewActionType.SET_COMPILE_RESULT_TYPE;
  data: CompileResultType;
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
