import { Extension } from "@codemirror/state";

export interface EditorAttr { 
    projectId: string;
    docId: string;
    theme: Extension,
    name: string
}