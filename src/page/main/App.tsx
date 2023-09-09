import React, { useRef, useState } from 'react';
import styles from './App.module.css';
import { ReactComponent as HiddenContent } from "@/assets/expert/hidden-content.svg";
const CollarCodeEditor = React.lazy(() => import('@/component/common/editor/CollarCodeEditor'));
import { useLocation } from 'react-router-dom';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { getFileList } from '@/service/file/FileService';
import { ResponseHandler } from 'rdjs-wheel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EHeader from '@/component/header/editor/EHeader';
import { readConfig } from '@/config/app/config-reader';
import queryString from 'query-string';
import Previewer from '@/component/common/previewer/Previewer';
import { compileProject, getLatestCompile, getTempAuthCode, sendQueueCompileRequest, updatePdfUrl } from '@/service/project/ProjectService';
import ProjectTree from '@/component/common/prjtree/ProjectTree';
import { TexFileModel } from '@/model/file/TexFileModel';

const App: React.FC = () => {

  const location = useLocation();
  const search = location.search;
  const params = queryString.parse(search);
  const pid = params.pid!;
  const { compileResult, latestComp, endSignal } = useSelector((state: AppState) => state.proj);
  const { activeFile, selectItem } = useSelector((state: AppState) => state.file);
  const [activeFileModel, setActiveFileModel] = useState<TexFileModel>();
  const [selectedItem, setSelectedItem] = useState<TexFileModel>();
  const divRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    resizeLeft("hiddenContentLeft", "prjTree");
    resizeRight("hiddenContentRight", "editor");
    if (pid) {
      getFileList(pid.toString()).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          getLatestCompile(pid.toString());
        }
      });
    }
    return () => {
    };
  }, []);

  React.useEffect(() => {
    if (endSignal && endSignal.length > 0 && endSignal === "TEX_COMP_END") {
      getLatestCompile(pid.toString());
    }
}, [endSignal]);

  React.useEffect(() => {
    setActiveFileModel(activeFile);
  }, [activeFile]);

  React.useEffect(() => {
    setSelectedItem(selectItem);
  }, [selectItem]);

  React.useEffect(() => {
    if (latestComp && Object.keys(latestComp).length > 0) {
      if (latestComp.path && latestComp.path.length > 0) {
        let pdfUrl = readConfig("compileBaseUrl") + "/" + latestComp.project_id + "/" + latestComp.path + "/main.pdf";
        updatePdfUrl(pdfUrl);
      } else {
        compile(pid.toString());
      }
    }
  }, [latestComp]);

  React.useEffect(() => {
    if (!compileResult || Object.keys(compileResult).length === 0) {
      return;
    }
    let proj_id = compileResult.project_id;
    let vid = compileResult.out_path;
    if (proj_id && vid) {
      const pdfUrl = readConfig("compileBaseUrl") + "/" + proj_id + "/" + vid + "/main.pdf";
      updatePdfUrl(pdfUrl);
    }
  }, [compileResult]);

  const compile = (prj_id: string) => {
    getTempAuthCode().then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        let params = {
          project_id: prj_id
        };
        sendQueueCompileRequest(params).then((resp) => {
          if (ResponseHandler.responseSuccess(resp)) {

          } else {
            //toast.error(resp.msg);
          }
        });
      } else {
        toast.error(resp.msg);
      }
    });
  }

  const resizeLeft = (resizeBarName: string, resizeArea: string) => {
    setTimeout(() => {
      let prevCursorOffset = -1;
      let resizing = false;
      const menu: any = document.getElementById(resizeArea);
      const resizeBar: any = document.getElementById(resizeBarName);
      if (resizeBar != null) {
        resizeBar.addEventListener("mousedown", () => {
          resizing = true
        });
      };
      window.addEventListener("mousemove", handleResizeMenu);
      window.addEventListener("mouseup", () => {
        resizing = false
      });

      function handleResizeMenu(e: any) {
        if (!resizing) {
          return
        }
        const { screenX } = e
        e.preventDefault()
        e.stopPropagation()
        if (prevCursorOffset === -1) {
          prevCursorOffset = screenX
        } else if (Math.abs(prevCursorOffset - screenX) >= 5) {
          menu.style.flex = `0 0 ${screenX}px`;
          menu.style.maxWidth = "100vw";
          prevCursorOffset = screenX;
        }
      }
    }, 1500);
  }

  const resizeRight = (resizeBarName: string, resizeArea: string) => {
    setTimeout(() => {
      let prevCursorOffset = -1;
      let resizing = false;
      const menu: HTMLElement | null = document.getElementById(resizeArea);
      const resizeBar: any = document.getElementById(resizeBarName);
      if (resizeBar !== null) {
        resizeBar.addEventListener("mousedown", () => {
          resizing = true
        });
      }
      window.addEventListener("mousemove", handleResizeMenu);
      window.addEventListener("mouseup", () => {
        resizing = false
      });

      function handleResizeMenu(e: any) {
        if (!resizing || menu == null) {
          return
        }
        if (!divRef.current) {
          return;
        }
        const prjTreeWidth = divRef.current.offsetWidth;
        const { screenX } = e
        e.preventDefault()
        e.stopPropagation()
        if (prevCursorOffset === -1) {
          prevCursorOffset = screenX
        } else if (Math.abs(prevCursorOffset - screenX) >= 5) {
          menu.style.flex = `0 0 ${screenX - prjTreeWidth}px`;
          menu.style.maxWidth = "100vw";
          prevCursorOffset = screenX;
        }
      }
    }, 1500);
  }

  return (
    <div className={styles.container}>
      <EHeader></EHeader>
      <div className={styles.editorBody}>
        {pid ? <ProjectTree projectId={pid as string} divRef={divRef}></ProjectTree> : <div>Loading...</div>}
        <div>
          <HiddenContent id="hiddenContentLeft" className={styles.hiddenContent} />
        </div>
        <div id="editor" className={styles.editor}>
          <div className={styles.editorHeader}></div>
          <React.Suspense fallback={<div>Loading...</div>}>
            <CollarCodeEditor projectId={pid.toString()}></CollarCodeEditor>
          </React.Suspense>
          <div className={styles.editorFooter}>
            {activeFileModel ? activeFileModel.name : "ddd"}
          </div>
        </div>
        <div>
          <HiddenContent id="hiddenContentRight" className={styles.hiddenContent} />
        </div>
        <Previewer></Previewer>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;