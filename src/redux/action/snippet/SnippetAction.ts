export type snippetAction = saveDocAction | getDocListAction | compileProjAction;

export enum SnippetActionType {
    DELETE_SNIPPET,
    EDIT_SNIPPET,
    GET_SNIPPET
}

export interface saveDocAction {
    type: SnippetActionType.DELETE_SNIPPET;
    data: any;
}

export interface getDocListAction {
    type: SnippetActionType.EDIT_SNIPPET;
    data: any;
}

export interface compileProjAction {
    type: SnippetActionType.GET_SNIPPET;
    data: any;
}