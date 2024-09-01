export type fileAction =
  | getFileListAction
  | chooseFileAction
  | getMainFileAction
  | getFileCodeAction
  | updateFileInitAction
  | switchEditorFileAction
  | setCurFileTreeAction;

export enum FileActionType {
  GET_FILE_LIST,
  GET_FILE_TREE,
  GET_FOLDER_TREE,
  ADD_FILE,
  MV_FILE,
  DOWNLOAD_FILE,
  ADD_FILE_HISTORY,
  CHOOSE_FILE,
  GET_MAIN_FILE,
  GET_FILE_CODE,
  UPDATE_FILE_INITIAL,
  SWITCH_EDITOR_FILE,
  RENAME_FILE,
  SET_CUR_FILE_TREE,
}

export interface getFileListAction {
  type: FileActionType.GET_FILE_LIST;
  data: any;
}

export interface getFileTreeAction {
  type: FileActionType.GET_FILE_TREE;
  data: any;
}

export interface getFolderTreeAction {
  type: FileActionType.GET_FOLDER_TREE;
  data: any;
}

export interface addFileAction {
  type: FileActionType.ADD_FILE;
  data: any;
}

export interface chooseFileAction {
  type: FileActionType.CHOOSE_FILE;
  data: any;
}

export interface getMainFileAction {
  type: FileActionType.GET_MAIN_FILE;
  data: any;
}

export interface getFileCodeAction {
  type: FileActionType.GET_FILE_CODE;
  data: any;
}

export interface updateFileInitAction {
  type: FileActionType.UPDATE_FILE_INITIAL;
  data: any;
}

export interface switchEditorFileAction {
  type: FileActionType.SWITCH_EDITOR_FILE;
  data: any;
}

export interface renameFileAction {
  type: FileActionType.RENAME_FILE;
  data: any;
}

export interface mvFileAction {
  type: FileActionType.MV_FILE;
  data: any;
}

export interface downloadFileAction {
  type: FileActionType.DOWNLOAD_FILE;
  data: any;
}

export interface setCurFileTreeAction {
  type: FileActionType.SET_CUR_FILE_TREE;
  data: any;
}
