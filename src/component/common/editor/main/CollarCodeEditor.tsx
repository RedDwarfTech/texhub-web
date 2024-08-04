import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
// @ts-ignore
import { WebsocketProvider } from "y-websocket";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import {
  initEditor,
  themeConfig,
  themeMap,
} from "@/service/editor/CollarEditorService";
import { TexFileModel } from "@/model/file/TexFileModel";
import {
  delProjInfo,
  getPdfPosition,
  projHasFile,
} from "@/service/project/ProjectService";
import { QueryPdfPos } from "@/model/request/proj/query/QueryPdfPos";
import { toast } from "react-toastify";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { ProjConfType } from "@/model/proj/config/ProjConfType";
import { readConfig } from "@/config/app/config-reader";
import { TreeFileType } from "@/model/file/TreeFileType";
import TableDesigner from "../table/TableDesigner";
import Snippet from "../snippet/Snippet";
import EquationDesigner from "../equation/EquationDesigner";
import { getCursorPos, handleSrcTreeNav } from "./CollarCodeEditorHandler";
import { BaseMethods } from "rdjs-wheel";

export type EditorProps = {
  projectId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<HTMLDivElement>(null);
  const { activeFile } = useSelector((state: AppState) => state.file);
  const { projInfo, projConf, activeShare, insertContext, replaceContext, connState } =
    useSelector((state: AppState) => state.proj);
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();
  const [mainFileModel, setMainFileModel] = useState<TexFileModel>();
  const [shareProj, setShareProj] = useState<boolean>();
  let editorView: [EditorView | undefined, WebsocketProvider | undefined];
  const activeKey = readConfig("projActiveFile") + props.projectId;
  let ws: WebsocketProvider;

  React.useEffect(() => {
    return () => {
      // try to delete the last state project info to avoid websocket connect to previous project through main file id
      delProjInfo();
      if (ws) {
        ws.destroy();
        ws = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setMainFileModel(projInfo.main_file);
      const activeFileJson = localStorage.getItem(activeKey);
      if (activeFileJson) {
        const curActiveFile: TexFileModel = JSON.parse(activeFileJson);
        let contains = projHasFile(
          curActiveFile.file_id,
          projInfo.main.project_id
        );
        if (contains) {
          init(curActiveFile);
        } else {
          init(projInfo.main_file);
        }
      } else {
        init(projInfo.main_file);
      }
    }
    return () => {
      destroy();
    };
  }, [projInfo]);

  React.useEffect(() => {
    setShareProj(activeShare);
  }, [activeShare]);

  React.useEffect(() => {
    handleInsertText(insertContext);
  }, [insertContext]);

  React.useEffect(() => {
    handleReplaceText(replaceContext);
  }, [replaceContext]);

  React.useEffect(() => {
    if (projConf && Object.keys(projConf).length > 0) {
      if (projConf.confYype == ProjConfType.Theme) {
        const currentTheme = themeMap.get(projConf.confValue);
        if (currentTheme) {
          if (!activeEditorView) return;
          activeEditorView.dispatch({
            effects: themeConfig.reconfigure(currentTheme),
          });
        }
      }
    }
  }, [projConf]);

  React.useEffect(() => {
    if (!activeFile || !activeFile.file_id) return;
    if (activeFile && activeFile.file_type !== TreeFileType.Folder) {
      let contains = projHasFile(activeFile.file_id, props.projectId);
      if (!contains) {
        return;
      }
      init(activeFile);
      localStorage.setItem(activeKey, JSON.stringify(activeFile));
    }
    return () => {
      destroy();
    };
  }, [activeFile]);

  const init = (file: TexFileModel) => {
    const editorAttr: EditorAttr = {
      projectId: props.projectId,
      docId: file.file_id,
      name: file.name,
      theme: themeMap.get("Solarized Light")!,
    };
    editorView = initEditor(editorAttr, activeEditorView, edContainer);
    setActiveEditorView(editorView[0]);
    ws = editorView[1]!;
  };

  const destroy = () => {
    if (activeEditorView) {
      setActiveEditorView(undefined);
    }
  };

  const handleInsertText = (text: string) => {
    if (text && activeEditorView) {
      var figureCodeArray: Array<string> = [text];
      const figureCode: string = figureCodeArray.join("\n");
      const cursorPos = activeEditorView.state.selection.main.head;
      const transaction = activeEditorView.state.update({
        changes: { from: cursorPos, to: cursorPos, insert: figureCode },
      });
      activeEditorView.dispatch(transaction);
    }
  };

  const handleReplaceText = (text: string) => {
    if (text && activeEditorView) {
      let doc = activeEditorView.state.doc;
      let size = doc.length;
      const transaction = activeEditorView.state.update({
        changes: { from: 0, to: size, insert: text },
      });
      activeEditorView.dispatch(transaction);
    }
  };

  const handleImageAdd = () => {
    if (activeEditorView) {
      var figureCodeArray: Array<string> = [
        "\\begin{figure}",
        "\t\\centering",
        "\t\\includegraphics[width=\\textwidth]{}",
        "\t\\caption{Caption}",
        "\t\\label{fig:my_label}",
        "\\end{figure}",
      ];
      const figureCode: string = figureCodeArray.join("\n");
      const cursorPos = activeEditorView.state.selection.main.head;
      const transaction = activeEditorView.state.update({
        changes: { from: cursorPos, to: cursorPos, insert: figureCode },
      });
      activeEditorView.dispatch(transaction);
    }
  };

  const handleTables = () => {};

  const handlePdfLocate = () => {
    if (mainFileModel && mainFileModel.name && activeEditorView) {
      let { line, column } = getCursorPos(activeEditorView);
      const selected = localStorage.getItem(
        "proj-select-file:" + props.projectId
      );
      if (!selected) {
        toast.info("请选择文件");
        return;
      }
      let selectFile: TexFileModel = JSON.parse(selected);
      if (BaseMethods.isNull(selectFile)) {
        // if the select file is null, then try to use the current active file
        let activeFile = localStorage.getItem(activeKey);
        if (!activeFile || BaseMethods.isNull(activeFile)) {
          toast.info("请选择文件");
          return;
        }
        selectFile = JSON.parse(activeFile);
      }
      let req: QueryPdfPos = {
        project_id: props.projectId,
        path: selectFile.file_path,
        file: selectFile.name,
        main_file: mainFileModel.name,
        line: line,
        column: column,
      };
      getPdfPosition(req);
    }
  };

  const renderConnState = (connState: string) => {
    debugger;
    switch (connState) {
      case "connected":
        return <i className={`fa-solid fa-wifi ${styles.stateConnect}`}></i>;
      case "disconnected":
        return <i className={`fa-solid fa-wifi ${styles.stateDisconnect}`}></i>;
      case "connecting":
        return <i className={`fa-solid fa-wifi ${styles.stateConnecting}`}></i>;
      default:
        return <i className={`fa-solid fa-wifi ${styles.stateDisconnect}`}></i>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <button
          className={styles.menuButton}
          data-bs-toggle="tooltip"
          title="导航到目录树"
          onClick={() => {
            handleSrcTreeNav(editorView);
          }}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button
          className={styles.menuButton}
          title="导航到PDF"
          onClick={() => {
            handlePdfLocate();
          }}
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <button
          className={styles.menuButton}
          title="插入图片"
          onClick={() => {
            handleImageAdd();
          }}
        >
          <i className="fa-solid fa-image"></i>
        </button>
        <button
          className={styles.menuButton}
          title="表格设计器"
          data-bs-toggle="modal"
          data-bs-target="#tableDesignerModal"
          onClick={() => {
            handleTables();
          }}
        >
          <i className="fa-solid fa-table"></i>
        </button>
        <button
          className={styles.menuButton}
          title="代码片段"
          data-bs-toggle="modal"
          data-bs-target="#snippetModal"
          onClick={() => {
            handleTables();
          }}
        >
          <i className="fa-solid fa-code"></i>
        </button>
        <button
          className={styles.menuButton}
          title="公式设计器"
          data-bs-toggle="modal"
          data-bs-target="#equationDesignerModal"
          onClick={() => {
            handleTables();
          }}
        >
          <i className="fa-solid fa-square-root-variable"></i>
        </button>
        <button
          className={styles.menuButton}
          title="连接状态"
          data-bs-toggle="modal"
          data-bs-target=""
          onClick={() => {}}
        >
          {renderConnState(connState)}
        </button>
      </div>
      <div ref={edContainer} className={styles.editorContainer}></div>
      <TableDesigner></TableDesigner>
      <Snippet></Snippet>
      <EquationDesigner></EquationDesigner>
    </div>
  );
};

export default CollarCodeEditor;
