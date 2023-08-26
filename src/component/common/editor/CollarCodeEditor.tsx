import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { initEditor } from "@/service/editor/CollarEditorService";
import { TexFileModel } from "@/model/file/TexFileModel";
import { getFileCode, getMainFile, updateFileInit } from "@/service/file/FileService";

export type EditorProps = {
  projectId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<any>();
  const { file, mainFile, fileCode } = useSelector((state: AppState) => state.file);
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();
  const [mainFileModel, setMainFileModel] = useState<TexFileModel>();

  React.useEffect(() => {
    getMainFile(props.projectId);
  }, []);

  React.useEffect(() => {
    if (!mainFile || Object.keys(mainFile).length === 0) {
      return;
    }
    let editorView: any = null;
    if (mainFile.yjs_initial === 0) {
      getFileCode(mainFile.file_id);
    }
    if (mainFile.yjs_initial === 1) {
      const init = async () => {
        editorView = await initEditor(props.projectId, mainFile.file_id, "", activeEditorView, edContainer);
        setActiveEditorView(editorView);
      };
      init();
      setMainFileModel(mainFile);
    }
    return () => {
      if (editorView) {
        editorView.destroy();
      }
    };
  }, [mainFile]);

  React.useEffect(() => {
    let editorView: any = null;
    if (fileCode && fileCode.length > 0) {
      const init = async () => {
        editorView = await initEditor(props.projectId, mainFile.file_id, fileCode.toString(), activeEditorView, edContainer);
        setActiveEditorView(editorView);
        updateFileInit(mainFile.file_id);
      };
      init();
      setMainFileModel(mainFile);
    }
    return () => {
      if (editorView) {
        editorView.destroy();
      }
    };
  }, [fileCode]);

  React.useEffect(() => {
    if (!file || !file.file_id) return;
    initEditor(props.projectId, file.file_id, "", activeEditorView, edContainer).then((view) => {
      setActiveEditorView(view);
    });

    return () => {
      if (activeEditorView) {
        activeEditorView.destroy();
      }
    };
  }, [file]);

  return (
    <div ref={edContainer} className={styles.container}>
    </div>
  );
}

export default CollarCodeEditor;