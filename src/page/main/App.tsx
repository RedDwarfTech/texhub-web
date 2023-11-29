import React, { useRef, useState } from 'react';
import styles from './App.module.css';
const CollarCodeEditor = React.lazy(() => import('@/component/common/editor/CollarCodeEditor'));
import { useLocation } from 'react-router-dom';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { ResponseHandler } from 'rdjs-wheel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EHeader from '@/component/header/editor/EHeader';
import { readConfig } from '@/config/app/config-reader';
import queryString from 'query-string';
import Previewer from '@/component/common/previewer/Previewer';
import {
  getProjectInfo,
  getTempAuthCode,
  sendQueueCompileRequest,
  setCompileQueue,
  setLatestCompile,
  showPreviewTab,
  updatePdfUrl
} from '@/service/project/ProjectService';
import ProjectTree from '@/component/common/projtree/ProjectTree';
import { TexFileModel } from '@/model/file/TexFileModel';
import { QueryProjInfo } from '@/model/request/proj/query/QueryProjInfo';
import { CompileResultType } from '@/model/proj/compile/CompileResultType';
import { BaseMethods } from 'rdjs-wheel';

const App: React.FC = () => {

  const location = useLocation();
  const search = location.search;
  const params = queryString.parse(search);
  const pid = params.pid!;
  const { compileResult, latestComp, endSignal, projInfo } = useSelector((state: AppState) => state.proj);
  const { activeFile, selectItem } = useSelector((state: AppState) => state.file);
  const [activeFileModel, setActiveFileModel] = useState<TexFileModel>();
  const [selectedItem, setSelectedItem] = useState<TexFileModel>();
  const [mainFile, setMainFile] = useState<TexFileModel>();
  const divRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    resizeRight("rightDraggable", "editor");
    if (pid) {
      let query: QueryProjInfo = {
        project_id: pid.toString()
      };
      getProjectInfo(query);
    }
    return () => {
    };
  }, []);

  React.useEffect(() => {
    if (endSignal && endSignal.length > 0) {
      let result = JSON.parse(endSignal);
      setLatestCompile(result.comp);
      setCompileQueue(result.queue);
      if (result && result.queue && result.queue.comp_result === CompileResultType.SUCCESS) {
        showPreviewTab("pdfview");
      }
    }
  }, [endSignal]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setMainFile(projInfo.main_file);
    }
  }, [projInfo]);

  React.useEffect(() => {
    setActiveFileModel(activeFile);
  }, [activeFile]);

  React.useEffect(() => {
    setSelectedItem(selectItem);
  }, [selectItem]);

  React.useEffect(() => {
    if (latestComp && Object.keys(latestComp).length > 0) {
      if (latestComp.path && latestComp.path.length > 0) {
        let pdfUrl = BaseMethods.joinUrl(readConfig("compileBaseUrl"), latestComp.path);
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
      let file_without_ext = mainFile?.name.replace(/\.[^/.]+$/, '');
      const pdfUrl = readConfig("compileBaseUrl") + "/" + proj_id + "/" + file_without_ext + ".pdf";
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

  const resizeRight = (resizeBarName: string, resizeArea: string) => {
    setTimeout(() => {
      let prevCursorOffset = -1;
      let resizing = false;
      const resizeElement: HTMLElement | null = document.getElementById(resizeArea);
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

      function handleResizeMenu(e: MouseEvent) {
        if (!resizing || resizeElement == null) {
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
          resizeElement.style.flex = `0 0 ${screenX - prjTreeWidth - 18}px`;
          resizeElement.style.maxWidth = "100vw";
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
        <div className={styles.leftDraggable} id="leftDraggable">
        </div>
        <div id="editor" className={styles.editor}>
          <React.Suspense fallback={<div>Loading...</div>}>
            <CollarCodeEditor projectId={pid.toString()}></CollarCodeEditor>
          </React.Suspense>
          <div className={styles.editorFooter}>
            {activeFileModel ? activeFileModel.name : "ddd"}
          </div>
        </div>
        <div className={styles.rightDraggable} id="rightDraggable">
        </div>
        <Previewer projectId={pid as string} viewModel={'default'}></Previewer>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;