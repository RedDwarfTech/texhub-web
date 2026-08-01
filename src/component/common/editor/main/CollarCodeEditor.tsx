import { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./CollarCodeEditor.module.css";
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { themeConfig } from "@/config/app/global-conf";
import { themeMap } from "@/component/common/editor/foundation/extensions/theme/theme";
import { TexFileModel } from "@/model/file/TexFileModel";
import { delProjInfo } from "@/service/project/ProjectService";
import { ProjConfType } from "@/model/proj/config/ProjConfType";
import { readConfig } from "@/config/app/config-reader";
import { TreeFileType } from "@/model/file/TreeFileType";
import TableDesigner from "../table/TableDesigner";
import Snippet from "../snippet/Snippet";
import EquationDesigner from "../equation/EquationDesigner";
import {
  handlePdfLocate,
  handleSrcTreeNav,
  initEditor,
} from "./CollarCodeEditorHandler";
import { useTranslation } from "react-i18next";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { BaseMethods } from "rdjs-wheel";
import { metadata } from "@/service/editor/CollarEditorSocketIOService";
import * as Y from "yjs";
import { SingleClientProvider } from "texhub-broadcast";
import { EditorState } from "@codemirror/state";
import logger from "@/common/storage/log/Logger";
import { createExtensions } from "../foundation/extensions/extensions";
import {
  clearCurRootYDoc,
  clearCurSubDoc,
  clearEditorInstance,
  clearSocketIOProvider,
  isWsProviderConnected,
  isWsProviderReady,
  setCurRootYDoc,
  setEditorInstance,
  setWsConnState,
} from "@/service/project/editor/EditorService";
import {
  COLLABORATION_RECONNECT_EXHAUSTED_EVENT,
  reconnectCollaboration,
} from "@/service/editor/CollarEditorSocketIOService";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { recordEditorViewUpdate } from "@/service/editor/EditorUpdateHistory";
import { toast } from "react-toastify";

// sometimes when we replaced the Y.Doc
// we need to bind the events to the new doc
const rebindEditorToYDoc = (
  newDoc: Y.Doc,
  guid: string,
  texEditorSocketIOWs: any,
  edContainer: React.RefObject<HTMLDivElement>,
  activeEditorView: EditorView | undefined,
  setEditorInstance: (view: EditorView) => void
) => {
  recordEditorViewUpdate("rebindEditorToYDoc", `Creating new view for guid: ${guid}`);
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
  recordEditorViewUpdate("rebindEditorToYDoc", `Set new editor instance for guid: ${guid}`);
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

  useEffect(() => {
    const onExhausted = () => {
      toast.warning(t("tips_ws_reconnect_exhausted"));
    };
    window.addEventListener(COLLABORATION_RECONNECT_EXHAUSTED_EVENT, onExhausted);
    return () => {
      window.removeEventListener(
        COLLABORATION_RECONNECT_EXHAUSTED_EVENT,
        onExhausted
      );
    };
  }, [t]);

  const handleVisibilityChange = () => {
    if (!texEditorSocketIOWs) {
      console.warn("provider is null");
      return;
    }
    if (isWsProviderConnected(texEditorSocketIOWs)) {
      setWsConnState("connected");
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
      clearSocketIOProvider();
    };
  }, []);

  const loadedDocGuidRef = useRef<string | null>(null);
  const editorViewRef = useRef<EditorView | undefined>();

  React.useEffect(() => {
    if (editorView && !BaseMethods.isNull(editorView) && editorView.state) {
      editorViewRef.current = editorView;
    }
  }, [editorView]);

  React.useEffect(() => {
    if (BaseMethods.isNull(curSubYDoc) || !curSubYDoc.guid) {
      return;
    }
    const guid = curSubYDoc.guid;

    recordEditorViewUpdate(
      "useEffect[curSubYDoc]",
      `curSubYDoc changed, guid: ${curSubYDoc.guid}`
    );

    const boundView = editorViewRef.current;
    const alreadyShowingDoc =
      loadedDocGuidRef.current === guid &&
      boundView &&
      !BaseMethods.isNull(boundView) &&
      boundView.state &&
      edContainer.current?.contains(boundView.dom);

    if (alreadyShowingDoc) {
      console.log("skip rebuild editor view for guid: ", guid);
      return;
    }

    if (!isWsProviderReady(texEditorSocketIOWs)) {
      logger.error("texEditorSocketIOWs is not ready");
      toast.warning(t("tips_file_switch_failed_ws"));
      return;
    }

    let ytext = curSubYDoc.getText(curSubYDoc.guid);
    const undoManager = new Y.UndoManager(ytext);
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

    if (edContainer.current) {
      edContainer.current.innerHTML = "";
      edContainer.current.id = curSubYDoc.guid + "-curSubYDoc-update";
    }

    if (boundView && !BaseMethods.isNull(boundView) && boundView.state) {
      boundView.destroy();
    }

    const newEditorView: EditorView = new EditorView({
      state: texEditorState,
      parent: edContainer.current!,
    });

    loadedDocGuidRef.current = guid;
    recordEditorViewUpdate(
      "useEffect[curSubYDoc]",
      `Setting editor instance for guid: ${curSubYDoc.guid}`
    );
    setEditorInstance(newEditorView);

    if (!curRootYDoc || BaseMethods.isNull(curRootYDoc)) {
      return;
    }
    if (curRootYDoc.getMap("texhubsubdoc").has(curSubYDoc.guid)) {
      const oldDoc: any = curRootYDoc
        .getMap("texhubsubdoc")
        .get(curSubYDoc.guid);
      const update = Y.encodeStateAsUpdate(oldDoc);
      // 用新的 Y.Doc 实例替换已同步的旧 doc，避免旧 doc 上残留的状态影响后续同步
      const newDoc = new Y.Doc({ guid: curSubYDoc.guid });
      Y.applyUpdate(newDoc, update);
      rebindEditorToYDoc(
        newDoc,
        curSubYDoc.guid,
        texEditorSocketIOWs,
        edContainer,
        newEditorView,
        setEditorInstance
      );
      curRootYDoc.getMap("texhubsubdoc").set(curSubYDoc.guid, newDoc);
      // map.set 会触发 subdocs 事件从而间接调用 addSubdoc 注册新 doc，
      // 但这里显式注册以保证：即使该事件在某种时序下未到达 handleSubDocChanged，
      // 新 doc 也一定挂上 update handler 并能广播 SubDocMessageSync。
      // addSubdoc 幂等，重复注册无害。
      if (texEditorSocketIOWs && typeof texEditorSocketIOWs.addSubdoc === "function") {
        texEditorSocketIOWs.addSubdoc(newDoc);
      }
      loadedDocGuidRef.current = guid;
    } else {
      curRootYDoc.getMap("texhubsubdoc").set(curSubYDoc.guid, curSubYDoc);
      // 同样显式注册新激活的 subdoc，保证编辑能立即同步
      if (texEditorSocketIOWs && typeof texEditorSocketIOWs.addSubdoc === "function") {
        texEditorSocketIOWs.addSubdoc(curSubYDoc);
      }
    }
    setCurRootYDoc(curRootYDoc);
  }, [curSubYDoc, texEditorSocketIOWs]);

  React.useEffect(() => {
    if (editorView) {
      recordEditorViewUpdate("useEffect[editorView]", "Redux editorView state changed");
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
      if (
        !texEditorSocketIOWs ||
        Object.keys(texEditorSocketIOWs).length === 0
      ) {
        // only initial for the fisrt time
        // the project info change in the furture will not re-initialize the editor
        initEditor(props.projectId, projInfo);
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
      if (Object.keys(activeFile).length === 0) {
        logger.warn("the active file is null", JSON.stringify(activeFile));
        return;
      }
      localStorage.setItem(activeKey, JSON.stringify(activeFile));
    }
    return () => {
      destroy();
    };
  }, [activeFile]);

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
      return <i className={`fa-solid fa-wifi ${styles.stateDisconnect}`}></i>;
    }
    const live = isWsProviderConnected(texEditorSocketIOWs);
    if (live || wsConnState === "connected") {
      return <i className={`fa-solid fa-wifi ${styles.stateConnect}`}></i>;
    }
    if (wsConnState === "connecting") {
      return <i className={`fa-solid fa-wifi ${styles.stateConnecting}`}></i>;
    }
    return <i className={`fa-solid fa-wifi ${styles.stateDisconnect}`}></i>;
  };

  const buildEditorAttr = (
    info: ProjInfo,
    file: TexFileModel
  ): EditorAttr => ({
    projectId: props.projectId,
    docIntId: file.id.toString(),
    docId: file.file_id,
    name: file.name,
    theme: themeMap.get("Solarized Light")!,
    docShowName: file.name,
  });

  const resolveLoadFile = (info: ProjInfo): TexFileModel | undefined => {
    const activeFileJson = localStorage.getItem(activeKey);
    if (activeFileJson) {
      try {
        return JSON.parse(activeFileJson) as TexFileModel;
      } catch {
        return info.main_file;
      }
    }
    return info.main_file;
  };

  /**
   * 协作 WebSocket 断开时手动重连（或纠正 Redux 状态与真实连接不一致）。
   */
  const tryReconnect = async () => {
    const info = curProjInfo ?? projInfo;
    if (!info || Object.keys(info).length === 0) {
      toast.warning(t("tips_loading"));
      return;
    }

    if (isWsProviderConnected(texEditorSocketIOWs)) {
      setWsConnState("connected");
      toast.info(t("tips_ws_already_connected"));
      return;
    }

    const loadFile = resolveLoadFile(info);
    if (!loadFile?.file_id) {
      toast.warning(t("tips_file_switch_failed_ws"));
      return;
    }

    try {
      await reconnectCollaboration(buildEditorAttr(info, loadFile), loadFile);
      toast.info(t("tips_ws_reconnecting"));
    } catch (err) {
      logger.error("manual ws reconnect failed", err);
      setWsConnState("disconnected");
      toast.error(t("tips_file_switch_failed_ws"));
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