import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
// @ts-ignore
import { WebsocketProvider } from "y-websocket";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { initEditor, themeConfig, themeMap } from "@/service/editor/CollarEditorService";
import { TexFileModel } from "@/model/file/TexFileModel";
import { delProjInfo, getPdfPosition, projHasFile } from "@/service/project/ProjectService";
import { QueryPdfPos } from "@/model/request/proj/query/QueryPdfPos";
import { toast } from "react-toastify";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { ProjConfType } from "@/model/proj/config/ProjConfType";
import { readConfig } from "@/config/app/config-reader";
import { TreeFileType } from "@/model/file/TreeFileType";

export type EditorProps = {
  projectId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<HTMLDivElement>(null)
  const { activeFile } = useSelector((state: AppState) => state.file);
  const { projInfo, projConf } = useSelector((state: AppState) => state.proj);
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();
  const [mainFileModel, setMainFileModel] = useState<TexFileModel>();
  let editorView: [EditorView | undefined, WebsocketProvider | undefined];
  const activeKey = readConfig("projActiveFile") + props.projectId;
  let ws: WebsocketProvider;

  React.useEffect(() => {
    return () => {
      // try to delete the last state project info to avoid websocket connect to previous project through main file id
      delProjInfo();
      if (ws) {
        ws.destroy();
        ws == null;
      }
    }
  }, []);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setMainFileModel(projInfo.main_file);
      const activeFileJson = localStorage.getItem(activeKey);
      if (activeFileJson) {
        const curActiveFile = JSON.parse(activeFileJson);
        let contains = projHasFile(curActiveFile.file_id, projInfo.main.project_id);
        if(contains){
          init(curActiveFile.file_id);
        }else{
          init(projInfo.main_file.file_id);
        }
      } else {
        init(projInfo.main_file.file_id);
      }
    }
    return () => {
      destroy();
    };
  }, [projInfo]);

  React.useEffect(() => {
    if (projConf && Object.keys(projConf).length > 0) {
      if (projConf.confYype == ProjConfType.Theme) {
        const currentTheme = themeMap.get(projConf.confValue);
        if (currentTheme) {
          if (!activeEditorView) return;
          activeEditorView.dispatch({
            effects: themeConfig.reconfigure(currentTheme)
          });
        }
      }
    }
  }, [projConf]);

  React.useEffect(() => {
    if (!activeFile || !activeFile.file_id) return;
    if (activeFile && activeFile.file_type !== TreeFileType.Folder) {
      let contains = projHasFile(activeFile.file_id, props.projectId);
      if(!contains) {
        debugger
        return;
      }
      init(activeFile.file_id);
      localStorage.setItem(activeKey, JSON.stringify(activeFile));
    }
    return () => {
      destroy();
    };
  }, [activeFile]);

  const init = (file_id: string) => {
    const editorAttr: EditorAttr = {
      projectId: props.projectId,
      docId: file_id,
      theme: themeMap.get("Solarized Light")!
    };
    editorView = initEditor(editorAttr, activeEditorView, edContainer);
    setActiveEditorView(editorView[0]);
    ws = editorView[1];
  };

  const destroy = () => {
    if (activeEditorView) {
      setActiveEditorView(undefined);
    }
  }

  const handlePdfLocate = () => {
    if (mainFileModel && mainFileModel.name && activeEditorView) {
      let { line, column } = getCursorPos(activeEditorView);
      const selected = localStorage.getItem("proj-select-file:" + props.projectId);
      if (!selected) {
        toast.info("请选择文件");
        return;
      }
      const selectFile: TexFileModel = JSON.parse(selected);
      let req: QueryPdfPos = {
        project_id: props.projectId,
        path: selectFile.file_path,
        file: selectFile.name,
        main_file: mainFileModel.name,
        line: line,
        column: column
      };
      getPdfPosition(req);
    }
  }

  const getCursorPos = (editor: EditorView): { line: number; column: number } => {
    if (editor && editor.state) {
      const cursor = editor.state.selection.main.head;
      const line = editor.state.doc.lineAt(cursor).number;
      const column = cursor - editor.state.doc.line(line).from;
      return {
        line: line,
        column: column
      };
    } else {
      return {
        line: 1,
        column: 1
      };
    }
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