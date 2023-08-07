export type fileAction = getFileListAction;

export enum FileActionType {
    GET_FILE_LIST,
    GET_FILE_TREE,
}

export interface getFileListAction {
    type: FileActionType.GET_FILE_LIST;
    data: any;
}

export interface getFileTreeAction {
    type: FileActionType.GET_FILE_TREE;
    data: any;
}