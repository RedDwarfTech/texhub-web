export type fileAction = getFileListAction;

export enum FileActionType {
    GET_FILE_LIST,
}

export interface getFileListAction {
    type: FileActionType.GET_FILE_LIST;
    data: any;
}