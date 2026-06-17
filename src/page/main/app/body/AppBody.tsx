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
const CollarCodeEditor = React.lazy(
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
    return (
      <div role="alert">
        <p>{t("err_something_wrong")}</p>
        <div style={{ color: "red" }}>
          {props.error instanceof Error ? props.error.message : String(props.error)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.editorBody}>
      <Split visible={[2, 3]}
        style={{ width: "100%", border: "0px solid #d5d5d5", borderRadius: 3 }}
      >
        <div style={{ width: "20%", minWidth: 30 }}>
          {pid ? (
            <ProjectTree
              projectId={pid as string}
              treeDivRef={projTreeRef}
            ></ProjectTree>
          ) : (
            <div>{t("tips_loading")}</div>
          )}
        </div>
        <div style={{ width: "60%", minWidth: 100 }}>
          <div id="editor" className={styles.editor}>
            <React.Suspense fallback={<div>{t("tips_loading")}</div>}>
              <ErrorBoundary fallbackRender={fallbackRender}>
                <CollarCodeEditor projectId={pid.toString()}></CollarCodeEditor>
              </ErrorBoundary>
            </React.Suspense>
          </div>
        </div>
        <div style={{ width: "20%", minWidth: 100 }}>
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
