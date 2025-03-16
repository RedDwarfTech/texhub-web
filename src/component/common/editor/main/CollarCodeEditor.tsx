import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
// @ts-ignore
import { WebsocketProvider } from "rdy-websocket";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { initEditor, themeConfig } from "@/service/editor/CollarEditorService";
import { themeMap } from "@/component/common/editor/foundation/extensions/theme/theme";
import { TexFileModel } from "@/model/file/TexFileModel";
import { delProjInfo, projHasFile } from "@/service/project/ProjectService";
import { toast } from "react-toastify";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { ProjConfType } from "@/model/proj/config/ProjConfType";
import { readConfig } from "@/config/app/config-reader";
import { TreeFileType } from "@/model/file/TreeFileType";
import TableDesigner from "../table/TableDesigner";
import Snippet from "../snippet/Snippet";
import EquationDesigner from "../equation/EquationDesigner";
import { handlePdfLocate, handleSrcTreeNav } from "./CollarCodeEditorHandler";
import { useTranslation } from "react-i18next";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { BaseMethods } from "rdjs-wheel";
import { io, ManagerOptions, SocketOptions } from "socket.io-client";
import { initSocketIOEditor } from "@/service/editor/CollarEditorSocketIOService";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider";

export type EditorProps = {
  projectId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<HTMLDivElement>(null);
  const { activeFile } = useSelector((state: AppState) => state.file);
  const { projInfo, projConf, insertContext, replaceContext } = useSelector(
    (state: AppState) => state.proj
  );
  const { connState, editor, texEditorWs, texEditorSocketIOWs } = useSelector(
    (state: AppState) => state.projEditor
  );
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();
  const [wsProvider, setWsProvider] = useState<WebsocketProvider>();
  const [wsSocketIOProvider, setWsSocketIOProvider] =
    useState<SocketIOClientProvider>();
  const [mainFileModel, setMainFileModel] = useState<TexFileModel>();
  const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
  const activeKey = readConfig("projActiveFile") + props.projectId;
  const { t } = useTranslation();

  React.useEffect(() => {
    return () => {
      // try to delete the last state project info to avoid websocket connect to previous project through main file id
      delProjInfo();
    };
  }, []);

  React.useEffect(() => {
    if (editor) {
      setActiveEditorView(editor);
    }
  }, [editor]);

  React.useEffect(() => {
    if (texEditorWs) {
      setWsProvider(texEditorWs);
    }
  }, [texEditorWs]);

  React.useEffect(() => {
    if (texEditorSocketIOWs) {
      setWsSocketIOProvider(texEditorSocketIOWs);
    }
  }, [texEditorSocketIOWs]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setCurProjInfo(projInfo);
      setMainFileModel(projInfo.main_file);
      const activeFileJson = localStorage.getItem(activeKey);
      if (activeFileJson) {
        const curActiveFile: TexFileModel = JSON.parse(activeFileJson);
        if (!projInfo.main) {
          console.error("main is null", JSON.stringify(projInfo));
          return;
        }
        let contains = projHasFile(
          curActiveFile.file_id,
          projInfo.main.project_id
        );
        if (contains) {
          preInitEditor(curActiveFile);
        } else {
          preInitEditor(projInfo.main_file);
        }
      } else {
        preInitEditor(projInfo.main_file);
      }
    }
    return () => {
      destroy();
    };
  }, [projInfo]);

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
    initByActiveFile(activeFile);
    return () => {
      destroy();
    };
  }, [activeFile]);

  React.useEffect(() => {
    if (texEditorWs) {
      setWsProvider(texEditorWs);
    }
  }, [texEditorWs]);

  const initByActiveFile = (activeFile: TexFileModel) => {
    if (!activeFile || !activeFile.file_id) return;
    if (activeFile && activeFile.file_type !== TreeFileType.Folder) {
      let contains = projHasFile(activeFile.file_id, props.projectId);
      if (!contains) {
        return;
      }
      switchEditorFile(activeFile);
      preInitEditor(activeFile);
      localStorage.setItem(activeKey, JSON.stringify(activeFile));
    }
  };

  const switchEditorFile = (activeFile: TexFileModel) => {
    let command = {
      fileId: activeFile.file_id,
      controlType: 1,
    };
    wsSocketIOProvider?.sendExtMsg(JSON.stringify(command));
  };

  const preInitEditor = (file: TexFileModel) => {
    const editorAttr: EditorAttr = {
      projectId: props.projectId,
      docId: file.file_id,
      name: file.name,
      theme: themeMap.get("Solarized Light")!,
    };
    let wsChannel = localStorage.getItem("legacyModel");
    if (wsChannel && wsChannel.toString() === "socketio") {
      initEditor(editorAttr, activeEditorView, edContainer, wsProvider);
    } else {
      initSocketIOEditor(editorAttr, activeEditorView, edContainer);
    }
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

  const renderConnState = (connState: string) => {
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

  /**
   * if the websocket connect disconnected
   * Try to reconnect the editor websocket
   */
  const tryReconnect = (connState: string) => {
    if (BaseMethods.isNull(connState)) {
      return;
    }
    switch (connState) {
      case "connected":
        break;
      case "disconnected":
        toast.info("try to reconnecting...");
        initByActiveFile(activeFile);
        break;
      case "connecting":
        toast.info("try to reconnecting...");
        initByActiveFile(activeFile);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <button
          className={styles.menuButton}
          data-bs-toggle="tooltip"
          title={t("btn_nav_tree")}
          onClick={() => {
            if (curProjInfo) {
              let activeFileJson = localStorage.getItem(activeKey);
              if (activeFileJson) {
                let activeFile: TexFileModel = JSON.parse(activeFileJson);
                handleSrcTreeNav(props, curProjInfo, activeFile);
              }
            }
          }}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button
          className={styles.menuButton}
          title={t("btn_nav_pdf")}
          onClick={() => {
            handlePdfLocate(mainFileModel, activeEditorView, props, activeKey);
          }}
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <button
          className={styles.menuButton}
          title={t("btn_insert_image")}
          onClick={() => {
            handleImageAdd();
          }}
        >
          <i className="fa-solid fa-image"></i>
        </button>
        <button
          className={styles.menuButton}
          title={t("title_table_designer")}
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
          title={t("title_snippet")}
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
          title={t("title_equation_designer")}
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
          title={t("icon_conn_status")}
          data-bs-toggle="modal"
          data-bs-target=""
          onClick={() => {
            tryReconnect(connState);
          }}
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
