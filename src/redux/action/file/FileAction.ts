export type fileAction = getFileListAction | chooseFileAction;

export enum FileActionType {
    GET_FILE_LIST,
    GET_FILE_TREE,
    ADD_FILE,
    CHOOSE_FILE
}

export interface getFileListAction {
    type: FileActionType.GET_FILE_LIST;
    data: any;
}

export interface getFileTreeAction {
    type: FileActionType.GET_FILE_TREE;
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