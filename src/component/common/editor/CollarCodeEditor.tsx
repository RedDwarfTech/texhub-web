import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { initEditor } from "@/service/editor/CollarEditorService";
import { updateFileInit } from "@/service/file/FileService";
import { TexFileModel } from "@/model/file/TexFileModel";
import { getPdfPosition } from "@/service/project/ProjectService";
import { QueryPdfPos } from "@/model/request/proj/query/QueryPdfPos";

export type EditorProps = {
  projectId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<any>();
  const { activeFile, mainFile, fileCode } = useSelector((state: AppState) => state.file);
  const { projInfo } = useSelector((state: AppState) => state.proj);
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();
  const [mainFileModel, setMainFileModel] = useState<TexFileModel>();
  let editorView: any = null;

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setMainFileModel(projInfo.main_file);
      init(projInfo.main_file.file_id);
    }
    return () => {
      destroy();
    };
  }, [projInfo]);

  React.useEffect(() => {
    if (fileCode && fileCode.length > 0) {
      if (mainFileModel && mainFileModel.yjs_initial === 0) {
        init(mainFile.file_id);
        updateFileInit(mainFile.file_id);
      }
    }
    return () => {
      destroy()
    };
  }, [fileCode]);

  React.useEffect(() => {
    if (!activeFile || !activeFile.file_id) return;
    if (activeFile && activeFile.file_type !== 0) {
      init(activeFile.file_id);
    }
    return () => {
      destroy();
    };
  }, [activeFile]);

  const init = (file_id: string) => {
    editorView = initEditor(props.projectId, file_id, activeEditorView, edContainer);
    setActiveEditorView(editorView);
  };

  const destroy = () => {
    if (editorView) {
      editorView.destroy();
    }
    if (activeEditorView) {
      setActiveEditorView(undefined);
    }
  }

  const handlePdfLocate = () => {
    if (mainFileModel && mainFileModel.name) {
      let { line, column } = getCursorPos(editorView);
      let req: QueryPdfPos = {
        project_id: props.projectId,
        file: mainFileModel.name,
        line: line,
        column: column
      };
      getPdfPosition(req);
    }
  }

  const getCursorPos = (editor: EditorView): { line: number; column: number } => {
    const cursor = editor.state.selection.main.head;
    const line = editor.state.doc.lineAt(cursor).number;
    const column = cursor - editor.state.doc.line(line).from;
    return {
      line: line + 1,
      column: column + 1
    };
  }

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <button className={styles.menuButton} onClick={() => { handlePdfLocate() }}>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <div ref={edContainer} className={styles.editorContainer}>
      </div>
    </div>
  );
}

export default CollarCodeEditor;