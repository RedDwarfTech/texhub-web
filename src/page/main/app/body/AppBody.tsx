import ProjectTree from "@/component/common/projtree/main/ProjectTree";
import styles from "./AppBody.module.css";
import { useRef } from "react";
import React from "react";
import RightDraggable from "@/assets/icon/right-drag.svg?react";
import Previewer from "@/component/common/previewer/Previewer";
import { VariableSizeList } from "react-window";
import { getProjectInfo } from "@/service/project/ProjectService";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
const CollarCodeEditor = React.lazy(
  () => import("@/component/common/editor/main/CollarCodeEditor")
);

export type AppBodyProps = {
  projectId: string;
};

const AppBody: React.FC<AppBodyProps> = (props: AppBodyProps) => {
  let pid = props.projectId;
  const projTreeRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    resizeRight("rightDraggable", "editor");
    if (pid) {
      let query: QueryProjInfo = {
        project_id: pid.toString(),
      };
      getProjectInfo(query);
    }
    return () => {};
  }, [pid]);

  const resizeRight = (resizeBarName: string, resizeArea: string) => {
    setTimeout(() => {
      let prevCursorOffset = -1;
      let resizing = false;
      const resizeElement: HTMLElement | null =
        document.getElementById(resizeArea);
      const resizeBar: HTMLElement | null =
        document.getElementById(resizeBarName);
      if (resizeBar !== null) {
        resizeBar.addEventListener("mousedown", () => {
          resizing = true;
        });
      }
      window.addEventListener("mousemove", handleResizeMenu);
      window.addEventListener("mouseup", () => {
        resizing = false;
      });

      function handleResizeMenu(e: MouseEvent) {
        if (!resizing || resizeElement == null) {
          return;
        }
        if (!projTreeRef.current) {
          return;
        }
        const projTreeWidth = projTreeRef.current.offsetWidth;
        const { screenX } = e;
        e.preventDefault();
        e.stopPropagation();
        if (prevCursorOffset === -1) {
          prevCursorOffset = screenX;
        } else if (Math.abs(prevCursorOffset - screenX) >= 5) {
          resizeElement.style.flex = `0 0 ${screenX - projTreeWidth - 18}px`;
          resizeElement.style.maxWidth = "100vw";
          prevCursorOffset = screenX;
        }
      }
    }, 1500);
  };

  const fallbackRender = (props: FallbackProps) => {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{ color: "red" }}>{props.error}</pre>
      </div>
    );
  };

  return (
    <div className={styles.editorBody}>
      {pid ? (
        <ProjectTree
          projectId={pid as string}
          treeDivRef={projTreeRef}
        ></ProjectTree>
      ) : (
        <div>Loading...</div>
      )}
      <div className={styles.leftDraggable} id="leftDraggable"></div>
      <div id="editor" className={styles.editor}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary fallbackRender={fallbackRender}>
            <CollarCodeEditor projectId={pid.toString()}></CollarCodeEditor>
          </ErrorBoundary>
        </React.Suspense>
      </div>
      <div className={styles.rightDraggable} id="rightDraggable">
        <RightDraggable className={styles.rightDraggableIcon}></RightDraggable>
      </div>
      <Previewer
        projectId={pid as string}
        viewModel={"default"}
      ></Previewer>
    </div>
  );
};

export default AppBody;
