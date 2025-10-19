import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { themeConfig } from "@/config/app/global-conf";
import { themeMap } from "@/component/common/editor/foundation/extensions/theme/theme";
import { TexFileModel } from "@/model/file/TexFileModel";
import { delProjInfo, projHasFile } from "@/service/project/ProjectService";
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
import {
  initSocketIOEditor,
  initSubDocSocketIO,
  metadata,
} from "@/service/editor/CollarEditorSocketIOService";
import * as Y from "rdyjs";
import { SingleClientProvider } from "texhub-broadcast";
import { EditorState } from "@codemirror/state";
import { createExtensions } from "../foundation/extensions/extensions";
import {
  clearCurRootYDoc,
  clearCurSubDoc,
  clearEditorInstance,
  setCurRootYDoc,
  setEditorInstance,
  setWsConnState,
} from "@/service/project/editor/EditorService";
import { isEnableSubDoc } from "@/common/EnvUtil.js";

// 重新绑定 codemirror 编辑器到新的 Y.Doc 文档
const rebindEditorToYDoc = (
  newDoc: Y.Doc,
  guid: string,
  texEditorSocketIOWs: any,
  edContainer: React.RefObject<HTMLDivElement>,
  activeEditorView: EditorView | undefined,
  setEditorInstance: (view: EditorView) => void
) => {
  const newYText = newDoc.getText(guid);
  const newUndoManager = new Y.UndoManager(newYText);
  const newEditorState: EditorState = EditorState.create({
    doc: newYText.toString(),
    extensions: createExtensions({
      ytext: newYText,
      wsProvider: texEditorSocketIOWs,
      undoManager: newUndoManager,
      docName: newDoc.guid,
      metadata: metadata,
    }),
  });
  // 清空编辑器容器，防止多个编辑器 DOM 残留
  if (edContainer.current) {
    edContainer.current.innerHTML = "";
  }
  const newEditorView: EditorView = new EditorView({
    state: newEditorState,
    parent: edContainer.current!,
  });
  if (activeEditorView && !BaseMethods.isNull(activeEditorView)) {
    activeEditorView?.destroy();
  }
  setEditorInstance(newEditorView);
};

export type EditorProps = {
  projectId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<HTMLDivElement>(null);
  const { activeFile } = useSelector((state: AppState) => state.file);
  const { projInfo, projConf, insertContext, replaceContext } = useSelector(
    (state: AppState) => state.proj
  );
  const { editorView, texEditorSocketIOWs, wsConnState } = useSelector(
    (state: AppState) => state.projEditor
  );
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();
  const [mainFileModel, setMainFileModel] = useState<TexFileModel>();
  const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
  const activeKey = readConfig("projActiveFile") + props.projectId;
  const { curSubYDoc, curRootYDoc } = useSelector(
    (state: AppState) => state.projEditor
  );
  const { t } = useTranslation();

  const handleVisibilityChange = () => {
    if (!texEditorSocketIOWs) {
      console.warn("provider is null");
      return;
    }
    let connected = texEditorSocketIOWs?.ws?.connected;
    if (connected) {
      setWsConnState("connected");
      console.log("connected is ok");
    } else {
      setWsConnState("disconnected");
      console.error("disconnected......");
    }
  };

  React.useEffect(() => {
    return () => {
      // try to delete the last state project info to avoid websocket connect to previous project through main file id
      delProjInfo();
      clearEditorInstance();
      clearCurRootYDoc();
      clearCurSubDoc();
      SingleClientProvider.destroy();
    };
  }, []);

  React.useEffect(() => {
    if (BaseMethods.isNull(curSubYDoc)) {
      return;
    }
    console.log("curSubYDoc", curSubYDoc);
    console.log("curEditorRootDoc", curRootYDoc);
    let ytext = curSubYDoc.getText(curSubYDoc.guid);
    const undoManager = new Y.UndoManager(ytext);
    if (!texEditorSocketIOWs) {
      console.error("texEditorSocketIOWs is null");
      return;
    }
    const texEditorState: EditorState = EditorState.create({
      doc: ytext.toString(),
      extensions: createExtensions({
        ytext: ytext,
        wsProvider: texEditorSocketIOWs,
        undoManager: undoManager,
        docName: curSubYDoc.guid,
        metadata: metadata,
      }),
    });
    const editorView: EditorView = new EditorView({
      state: texEditorState,
      parent: edContainer.current!,
    });
    if (activeEditorView && !BaseMethods.isNull(activeEditorView)) {
      activeEditorView?.destroy();
    }
    setEditorInstance(editorView);
    if (!curRootYDoc || BaseMethods.isNull(curRootYDoc)) {
      return;
    }
if (curRootYDoc.getMap("texhubsubdoc").has(curSubYDoc.guid)) {
  const oldDoc: any = curRootYDoc
    .getMap("texhubsubdoc")
    .get(curSubYDoc.guid);
  const update = Y.encodeStateAsUpdate(oldDoc);
  const newDoc = new Y.Doc({ guid: curSubYDoc.guid });
  Y.applyUpdate(newDoc, update);
  const subDocText = newDoc.getText(curSubYDoc.guid);
  subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
    console.log("doc(new) receive update,id:" + curSubYDoc.guid);
    // updateEditor(tr, event, newDoc, editorView!);
  });
  rebindEditorToYDoc(
    newDoc,
    curSubYDoc.guid,
    texEditorSocketIOWs,
    edContainer,
    activeEditorView,
    setEditorInstance
  );
  curRootYDoc.getMap("texhubsubdoc").set(curSubYDoc.guid, newDoc);
} else {
      const subDocText = curSubYDoc.getText(curSubYDoc.guid);
      subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
        console.log("doc receive update,id:" + curSubYDoc.guid);
        // updateEditor(tr, event, curSubYDoc, editorView!);
      });
      curRootYDoc.getMap("texhubsubdoc").set(curSubYDoc.guid, curSubYDoc);
    }
    setCurRootYDoc(curRootYDoc);
  }, [curSubYDoc]);

  React.useEffect(() => {
    if (editorView) {
      setActiveEditorView(editorView);
    }
  }, [editorView]);

  React.useEffect(() => {
    if (texEditorSocketIOWs) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [texEditorSocketIOWs, handleVisibilityChange]);

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
      if (projConf.confYype === ProjConfType.Theme) {
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
    if (activeFile && activeFile.file_type !== TreeFileType.Folder) {
      localStorage.setItem(activeKey, JSON.stringify(activeFile));
    }
    if (isEnableSubDoc()) {
      return;
    }
    initByActiveFile(activeFile);
    return () => {
      destroy();
    };
  }, [activeFile]);

  const initByActiveFile = (activeFile: TexFileModel) => {
    if (!activeFile || !activeFile.file_id) return;
    if (activeFile && activeFile.file_type !== TreeFileType.Folder) {
      let contains = projHasFile(activeFile.file_id, props.projectId);
      if (!contains) {
        return;
      }
      preInitEditor(activeFile);
      localStorage.setItem(activeKey, JSON.stringify(activeFile));
    }
  };

  const preInitEditor = (loadFile: TexFileModel) => {
    const editorAttr: EditorAttr = {
      projectId: props.projectId,
      docIntId: loadFile.id.toString(),
      docId: loadFile.file_id,
      name: loadFile.name,
      theme: themeMap.get("Solarized Light")!,
      docShowName: loadFile.name,
    };

    if (isEnableSubDoc()) {
      initSubDocSocketIO(editorAttr, loadFile);
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

  const renderConnState = () => {
    if (!texEditorSocketIOWs) {
      console.warn("provider is null");
      return;
    }
    if (wsConnState === "connected") {
      return <i className={`fa-solid fa-wifi ${styles.stateConnect}`}></i>;
    } else {
      return <i className={`fa-solid fa-wifi ${styles.stateDisconnect}`}></i>;
    }
  };

  /**
   * if the websocket connect disconnected
   * Try to reconnect the editor websocket
   */
  const tryReconnect = () => {
    if (!texEditorSocketIOWs) {
      console.warn("provider is null");
      return;
    }
    if (wsConnState === "connected") {
      console.log("tryReconnect connected is ok");
    } else {
      // try reconnect
      console.log("try reconnect");
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
                handleSrcTreeNav(props, curProjInfo, activeFile, curRootYDoc!);
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
          data-bs-target=""
          onClick={() => {
            tryReconnect();
          }}
        >
          {renderConnState()}
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
