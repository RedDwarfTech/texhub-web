import ProjectTree from "@/component/common/projtree/main/ProjectTree";
import styles from "./AppBody.module.css";
import { useRef } from "react";
import React from "react";
import Previewer from "@/component/common/previewer/main/Previewer";
import { getProjectInfo } from "@/service/project/ProjectService";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import Split from "@uiw/react-split";
import { useTranslation } from "react-i18next";
import {
  isChunkLoadError,
  lazyWithReload,
  reloadOnChunkLoadError,
} from "@/common/lazyWithReload";

const CollarCodeEditor = lazyWithReload(
  () => import("@/component/common/editor/main/CollarCodeEditor")
);

export type AppBodyProps = {
  projectId: string;
};

const AppBody: React.FC<AppBodyProps> = (props: AppBodyProps) => {
  let pid = props.projectId;
  const projTreeRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (pid) {
      let query: QueryProjInfo = {
        project_id: pid.toString(),
      };
      getProjectInfo(query);
    }
    return () => {};
  }, [pid]);

  const fallbackRender = (props: FallbackProps) => {
    if (reloadOnChunkLoadError(props.error)) {
      return <div>{t("tips_loading")}</div>;
    }
    const chunkFailed = isChunkLoadError(props.error);
    return (
      <div role="alert">
        <p>{chunkFailed ? t("err_chunk_load_failed") : t("err_something_wrong")}</p>
        {!chunkFailed && (
          <div style={{ color: "red" }}>
            {props.error instanceof Error
              ? props.error.message
              : String(props.error)}
          </div>
        )}
        {chunkFailed && (
          <button type="button" onClick={() => window.location.reload()}>
            {t("btn_reload_page")}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.editorBody}>
      <Split visible={[2, 3]}
        style={{ width: "100%", height: "100%", minHeight: 0, border: "0px solid #d5d5d5", borderRadius: 3 }}
      >
        <div className={styles.splitPane} style={{ width: "20%", minWidth: 30 }}>
          {pid ? (
            <ProjectTree
              projectId={pid as string}
              treeDivRef={projTreeRef}
            ></ProjectTree>
          ) : (
            <div>{t("tips_loading")}</div>
          )}
        </div>
        <div className={styles.splitPane} style={{ width: "60%", minWidth: 100 }}>
          <div id="editor" className={styles.editor}>
            <ErrorBoundary fallbackRender={fallbackRender}>
              <React.Suspense fallback={<div>{t("tips_loading")}</div>}>
                <CollarCodeEditor projectId={pid.toString()}></CollarCodeEditor>
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </div>
        <div className={styles.splitPane} style={{ width: "20%", minWidth: 100 }}>
          {pid ? (
            <Previewer
              projectId={pid as string}
              viewModel={"default"}
            ></Previewer>
          ) : (
            <div>{t("tips_loading")}</div>
          )}
        </div>
      </Split>
    </div>
  );
};

export default AppBody;
