import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { initEditor } from "@/service/editor/CollarEditorService";

export type EditorProps = {
  projectId: string;
  docId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<any>();
  const { file } = useSelector((state: AppState) => state.file);
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();

  React.useEffect(() => {
    const view = initEditor(props.projectId, props.docId, activeEditorView, edContainer);
    setActiveEditorView(view);
    return () => {
      view.destroy();
    };
  }, []);

  React.useEffect(() => {
    if (!file || !file.file_id) return;
    const view = initEditor(props.projectId, file.file_id, activeEditorView, edContainer);
    setActiveEditorView(view);
    return () => {
      view.destroy();
    };
  }, [file]);

  return <div ref={edContainer} className={styles.container}>
  </div>;
}

export default CollarCodeEditor;