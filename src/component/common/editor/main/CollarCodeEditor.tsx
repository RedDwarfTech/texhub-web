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
  forceSetCurSubDoc,
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
import { reportFileSwitchFailed } from "@/service/log/SystemLogService";
import { toast } from "react-toastify";

// 文件切换时协作连接未就绪：等待窗口内自动切换，超时后恢复原提示。
const FILE_SWITCH_WAIT_WS_TIMEOUT_MS = 15000;

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
    if (document.visibilityState !== "visible") {
      return;
    }
    if (isWsProviderConnected(texEditorSocketIOWs)) {
      setWsConnState("connected");
    } else {
      setWsConnState("disconnected");
      console.error("disconnected......");
      // 后台期间连接已被服务器 ping 超时断开，回到前台立即尝试恢复
      tryReconnect();
    }
  };

  React.useEffect(() => {
    return () => {
      if (pendingSwitchTimerRef.current) {
        clearTimeout(pendingSwitchTimerRef.current);
        pendingSwitchTimerRef.current = null;
      }
      pendingSwitchDocRef.current = null;
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
  const loadedDocRef = useRef<Y.Doc | null>(null);
  const editorViewRef = useRef<EditorView | undefined>();
  const pendingSwitchDocRef = useRef<Y.Doc | null>(null);
  const pendingSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(() => {
    if (editorView && !BaseMethods.isNull(editorView) && editorView.state) {
      editorViewRef.current = editorView;
    }
  }, [editorView]);

  React.useEffect(() => {
    if (wsConnState !== "connected") {
      return;
    }
    if (!pendingSwitchDocRef.current) {
      return;
    }
    const pendingDoc = pendingSwitchDocRef.current;
    pendingSwitchDocRef.current = null;
    if (pendingSwitchTimerRef.current) {
      clearTimeout(pendingSwitchTimerRef.current);
      pendingSwitchTimerRef.current = null;
    }
    logger.info("ws ready, apply deferred file switch", {
      guid: pendingDoc.guid,
    });
    forceSetCurSubDoc(pendingDoc);
  }, [wsConnState]);

  React.useEffect(() => {
    if (BaseMethods.isNull(curSubYDoc) || !curSubYDoc.guid) {
      return;
    }
    const guid = curSubYDoc.guid;

    recordEditorViewUpdate(
      "useEffect[curSubYDoc]",
      `curSubYDoc changed, guid: ${curSubYDoc.guid}`
    );

    // 同一 guid 在 root doc 的 texhubsubdoc map 中只保留一个稳定实例。
    // 若 map 中已存在该文件，直接复用（load + addSubdoc），绝不替换成新的实例；
    // 否则多个浏览器各自嵌入同 guid 的新实例，会在 root doc 同步时触发 Yjs 冲突，
    // 销毁其中一个实例后，对应浏览器的 subdoc update 事件永久失效（另一个浏览器失联）。
    const rootYDoc =
      curRootYDoc &&
      !BaseMethods.isNull(curRootYDoc) &&
      typeof curRootYDoc.getMap === "function"
        ? curRootYDoc
        : undefined;
    const subDocMap: Y.Map<Y.Doc> | undefined = rootYDoc?.getMap(
      "texhubsubdoc"
    );
    const existingSubDoc = subDocMap?.get(guid);
    const targetDoc =
      existingSubDoc && !BaseMethods.isNull(existingSubDoc)
        ? existingSubDoc
        : curSubYDoc;

    const boundView = editorViewRef.current;
    const alreadyShowingDoc =
      loadedDocGuidRef.current === guid &&
      loadedDocRef.current === targetDoc &&
      boundView &&
      !BaseMethods.isNull(boundView) &&
      boundView.state &&
      edContainer.current?.contains(boundView.dom);

    if (alreadyShowingDoc) {
      console.log("skip rebuild editor view for guid: ", guid);
      return;
    }

    if (!isWsProviderReady(texEditorSocketIOWs)) {
      logger.warn("texEditorSocketIOWs is not ready, defer file switch", {
        guid,
      });
      pendingSwitchDocRef.current = targetDoc;
      if (pendingSwitchTimerRef.current) {
        clearTimeout(pendingSwitchTimerRef.current);
      }
      pendingSwitchTimerRef.current = setTimeout(() => {
        pendingSwitchDocRef.current = null;
        pendingSwitchTimerRef.current = null;
        toast.warning(t("tips_file_switch_failed_ws"));
        reportFileSwitchFailed({
          projectId: props.projectId,
          guid,
          provider: texEditorSocketIOWs,
          pendingGuid: targetDoc.guid,
          reason: "ws not ready, file switch wait timeout",
        });
      }, FILE_SWITCH_WAIT_WS_TIMEOUT_MS);
      return;
    }

    let ytext = targetDoc.getText(targetDoc.guid);
    const undoManager = new Y.UndoManager(ytext);
    const texEditorState: EditorState = EditorState.create({
      doc: ytext.toString(),
      extensions: createExtensions({
        ytext: ytext,
        wsProvider: texEditorSocketIOWs,
        undoManager: undoManager,
        docName: targetDoc.guid,
        metadata: metadata,
      }),
    });

    if (edContainer.current) {
      edContainer.current.innerHTML = "";
      edContainer.current.id = targetDoc.guid + "-curSubYDoc-update";
    }

    if (boundView && !BaseMethods.isNull(boundView) && boundView.state) {
      boundView.destroy();
    }

    const newEditorView: EditorView = new EditorView({
      state: texEditorState,
      parent: edContainer.current!,
    });

    loadedDocGuidRef.current = guid;
    loadedDocRef.current = targetDoc;
    recordEditorViewUpdate(
      "useEffect[curSubYDoc]",
      `Setting editor instance for guid: ${targetDoc.guid}`
    );
    setEditorInstance(newEditorView);

    if (!rootYDoc) {
      return;
    }
    if (subDocMap && subDocMap.has(guid)) {
      // 已存在于 map：复用既有实例并激活，不替换，避免产生同 guid 冲突项
      targetDoc.load();
    } else if (subDocMap) {
      subDocMap.set(guid, targetDoc);
      targetDoc.load();
    }
    // addSubdoc 幂等：复用 map 既有实例时也显式注册，保证编辑能立即同步
    if (texEditorSocketIOWs && typeof texEditorSocketIOWs.addSubdoc === "function") {
      texEditorSocketIOWs.addSubdoc(targetDoc);
    }
    setCurRootYDoc(rootYDoc);
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
      reportFileSwitchFailed({
        projectId: props.projectId,
        provider: texEditorSocketIOWs,
        reason: "manual reconnect, no loadable file",
      });
      return;
    }

    try {
      await reconnectCollaboration(buildEditorAttr(info, loadFile), loadFile);
      toast.info(t("tips_ws_reconnecting"));
    } catch (err) {
      logger.error("manual ws reconnect failed", err);
      setWsConnState("disconnected");
      toast.error(t("tips_file_switch_failed_ws"));
      reportFileSwitchFailed({
        projectId: props.projectId,
        provider: texEditorSocketIOWs,
        reason: "manual reconnect failed",
      });
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