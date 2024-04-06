export type snippetAction = saveDocAction | getDocListAction | compileProjAction;

export enum SnippetActionType {
    DELETE_SNIPPET,
    EDIT_SNIPPET,
    ADD_SNIPPET,
    GET_SNIPPET_LIST
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
    type: SnippetActionType.GET_SNIPPET_LIST;
    data: any;
}