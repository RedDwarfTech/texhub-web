import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { initEditor } from "@/service/editor/CollarEditorService";
import { getFileCode, getMainFile, updateFileInit } from "@/service/file/FileService";
import { TexFileModel } from "@/model/file/TexFileModel";

export type EditorProps = {
  projectId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<any>();
  const { activeFile, mainFile, fileCode } = useSelector((state: AppState) => state.file);
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();
  const [mainFileModel, setMainFileModel] = useState<TexFileModel>();
  let editorView: any = null;

  React.useEffect(() => {
    getMainFile(props.projectId);
    return () => {
      destroy();
    };
  }, []);

  React.useEffect(() => {
    if (!mainFile || Object.keys(mainFile).length === 0) {
      return;
    }
    setMainFileModel(mainFile);
    if (mainFile.yjs_initial === 0 && editorView == null) {
      getFileCode(mainFile.file_id);
    }
    if (mainFile.yjs_initial === 1 && editorView == null) {
      init("", mainFile.file_id);
    }
    return () => {
      destroy();
    };
  }, [mainFile]);

  React.useEffect(() => {
    if (fileCode && fileCode.length > 0) {
      if (mainFileModel && mainFileModel.yjs_initial === 0) {
        init(fileCode.toString(), mainFile.file_id);
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
      init("",activeFile.file_id);
    }
    return () => {
      destroy();
    };
  }, [activeFile]);

  const init = (initCode: string, file_id: string) => {
    editorView = initEditor(props.projectId, file_id, initCode, activeEditorView, edContainer);
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

  return (
    <div ref={edContainer} className={styles.container}>
    </div>
  );
}

export default CollarCodeEditor;