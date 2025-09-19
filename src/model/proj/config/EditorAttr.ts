import { Extension } from "@codemirror/state";

export interface EditorAttr { 
    projectId: string;
    docId: string;
    docIntId: string;
    theme: Extension,
    name: string,
    docShowName: string,
}