import { EditorView } from "codemirror";
import { WebsocketProvider } from "rdy-websocket";

export const getCursorPos = (
  editor: EditorView
): { line: number; column: number } => {
  if (editor && editor.state) {
    const cursor = editor.state.selection.main.head;
    const line = editor.state.doc.lineAt(cursor).number;
    const column = cursor - editor.state.doc.line(line).from;
    return {
      line: line,
      column: column,
    };
  } else {
    return {
      line: 1,
      column: 1,
    };
  }
};

export const handleSrcTreeNav = (editor: [EditorView | undefined, WebsocketProvider | undefined]) => {


}