import ProjectTree from "@/component/common/projtree/main/ProjectTree";
import styles from "./AppBody.module.css";
import { useRef, useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import RightDraggable from "@/assets/icon/right-drag.svg?react";
import Previewer from "@/component/common/previewer/Previewer";
import { VariableSizeList } from "react-window";
import { getProjectInfo } from "@/service/project/ProjectService";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
const CollarCodeEditor = React.lazy(
    () => import("@/component/common/editor/main/CollarCodeEditor")
  );
  
export type AppBodyProps = {
  projectId: string;
};

const AppBody: React.FC<AppBodyProps> = (props: AppBodyProps) => {
  let pid = props.projectId;
  const projTreeRef = useRef<HTMLDivElement>(null);
  const [activeFileModel, setActiveFileModel] = useState<TexFileModel>();
  const { activeFile } = useSelector((state: AppState) => state.file);
  const virtualListRef = React.useRef<VariableSizeList>(null);

  React.useEffect(() => {
    resizeRight("rightDraggable", "editor");
    if (pid) {
      let query: QueryProjInfo = {
        project_id: pid.toString(),
      };
      getProjectInfo(query);
    }
    return () => {};
  }, []);

  React.useEffect(() => {
    setActiveFileModel(activeFile);
  }, [activeFile]);

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
          <CollarCodeEditor projectId={pid.toString()}></CollarCodeEditor>
        </React.Suspense>
        <div className={styles.editorFooter}>
          {activeFileModel ? activeFileModel.name : "ddd"}
        </div>
      </div>
      <div className={styles.rightDraggable} id="rightDraggable">
        <RightDraggable className={styles.rightDraggableIcon}></RightDraggable>
      </div>
      <Previewer
        projectId={pid as string}
        viewModel={"default"}
        virtualListRef={virtualListRef}
      ></Previewer>
    </div>
  );
};

export default AppBody;
