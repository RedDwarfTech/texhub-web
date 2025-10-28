import React, { ChangeEvent, useMemo, useState } from "react";
import styles from "./Previewer.module.css";
import { ToastContainer } from "react-toastify";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import MemoizedPDFPreview from "../doc/MemoizedPDFPreview";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { CompileQueue } from "@/model/proj/CompileQueue";
import {
  getLatestCompile,
  setCompileQueue,
  setLatestCompile,
  showPreviewTab,
  updatePdfUrl,
} from "@/service/project/ProjectService";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { BaseMethods } from "rdjs-wheel";
import { ProjInfo } from "@/model/proj/ProjInfo";
import {
  enterFullScreen,
  restorePdfOffset,
  scrollToPage,
} from "../doc/PDFPreviewHandle";
import { useTranslation } from "react-i18next";
import { getPdfjsOptions } from "@/config/pdf/PdfJsConfig";
import {
  compile,
  debugApp,
  handleDownloadPdf,
  handleOpenInBrowserDirect,
  handleSrcLocate,
} from "./PreviewerHandler";
import { VariableSizeList } from "react-window";
import {
  setContextCompileResultType,
  setAndDispatchPdfPage,
} from "@/service/project/preview/PreviewService";
import { usePreviewHandler } from "./usePreviewHandler";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/${pdfjs.version}/pdf.worker.min.mjs`;

export type PreviwerProps = {
  projectId: string;
  viewModel: string;
  curPage?: number;
};

const Previewer: React.FC<PreviwerProps> = (props: PreviwerProps) => {
  const [curPdfUrl, setCurPdfUrl] = useState<string>("");
  const [compStatus, setCompStatus] = useState<CompileStatus>(
    CompileStatus.COMPLETE
  );
  const { compileResultType } = useSelector((state: AppState) => state.preview);
  const [curLogText, setCurLogText] = useState<string>("");
  const [curPreviewTab, setCurPreviewTab] = useState<string>("pdfview");
  const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
  const [curCompileQueue, setCurCompileQueue] = useState<CompileQueue>();
  const [texCompileResult, setTexCompileResult] = useState<CompileResultType>(
    CompileResultType.SUCCESS
  );
  const [numPages, setNumPages] = useState<number>();
  const [devModel, setDevModel] = useState<boolean>();
  const virtualListRef = React.useRef<VariableSizeList>(null);
  const { handleScrollTop, handleZoomIn, handleFullScreen, handleZoomOut } =
    usePreviewHandler(props.projectId, props.viewModel);
  const { curPage } = useSelector((state: AppState) => state.preview);
  const {
    texPdfUrl,
    streamLogText,
    logText,
    tabName,
    compileStatus,
    queue,
    latestComp,
    projInfo,
    endSignal,
    remoteCompileResult,
  } = useSelector((state: AppState) => state.proj);
  const { t } = useTranslation();

  React.useEffect(() => {
    let devModelFlag = localStorage.getItem("devModel");
    if (devModelFlag && Boolean(devModelFlag) === true) {
      setDevModel(true);
    } else {
      setDevModel(false);
    }
  }, []);

  React.useEffect(() => {
    setTexCompileResult(compileResultType);
  }, [compileResultType]);

  React.useEffect(() => {
    getLatestCompile(props.projectId);
  }, [props.projectId]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setCurProjInfo(projInfo);
    }
  }, [projInfo]);

  React.useEffect(() => {
    if (latestComp && Object.keys(latestComp).length > 0) {
      if (latestComp.path && latestComp.path.length > 0) {
        let newPdfUrl = "/tex/file/pdf/partial?proj_id=" + props.projectId;
        updatePdfUrl(newPdfUrl);
      } else {
        compile(props.projectId.toString());
      }
    }
  }, [latestComp]);

  React.useEffect(() => {
    if (!remoteCompileResult || Object.keys(remoteCompileResult).length === 0) {
      return;
    }
    let proj_id = remoteCompileResult.project_id;
    let vid = remoteCompileResult.out_path;
    if (proj_id && vid) {
      let newPdfUrl = "/tex/file/pdf/partial?proj_id=" + props.projectId;
      updatePdfUrl(newPdfUrl);
    }
  }, [remoteCompileResult]);

  React.useEffect(() => {
    if (endSignal && endSignal.length > 0) {
      let result = JSON.parse(endSignal);
      setLatestCompile(result.comp);
      setCompileQueue(result.queue);
      if (
        result &&
        result.queue &&
        result.queue.comp_result === CompileResultType.SUCCESS
      ) {
        showPreviewTab("pdfview");
      }
    }
  }, [endSignal]);

  React.useEffect(() => {
    if (texPdfUrl && texPdfUrl.length > 0) {
      setCurPdfUrl(texPdfUrl);
    }
  }, [texPdfUrl]);

  React.useEffect(() => {
    setCurCompileQueue(queue);
  }, [queue]);

  React.useEffect(() => {
    setCompStatus(compileStatus);
  }, [compileStatus]);

  React.useEffect(() => {
    if (logText && logText === "====CLEAR====") {
      setCurLogText("");
      return;
    }
    if (logText && logText.length > 0 && logText !== "====CLEAR====") {
      setCompStatus(CompileStatus.COMPLETE);
      setCurLogText(logText);
    }
  }, [logText]);

  React.useEffect(() => {
    if (tabName && tabName.length > 0) {
      setCurPreviewTab(tabName);
    }
  }, [tabName]);

  React.useEffect(() => {
    if (streamLogText && streamLogText.length > 0) {
      let stringLog = streamLogText.map((log) => log.data).join("");
      if (stringLog.indexOf("====CLEAR====") > 0) {
        setCurLogText("");
        return;
      }
      setCompStatus(CompileStatus.COMPILING);
      setCurLogText((prevState) => {
        return getNewText(prevState, stringLog);
      });
    }
  }, [streamLogText]);

  const getNewText = (prevState: any, streamLogText: string) => {
    let newLogText = "";
    if (prevState && prevState.length > 0) {
      if (streamLogText.startsWith("!")) {
        console.log("compilewitherror");
        newLogText =
          prevState + "<br/><p style='color:red;'>" + streamLogText + "</p>";
        setContextCompileResultType(CompileResultType.FAILED);
      } else {
        newLogText = prevState + "<br/>" + streamLogText;
      }
      if (
        texCompileResult !== CompileResultType.FAILED &&
        streamLogText.indexOf("====END====") >= 0
      ) {
        setContextCompileResultType(CompileResultType.SUCCESS);
      }
    } else {
      newLogText = prevState + streamLogText;
    }
    return newLogText;
  };

  const renderPreviewTab = () => {
    switch (curPreviewTab) {
      case "pdfview":
        return renderPdfView();
      case "logview":
        return renderLogView();
      default:
        return <div></div>;
    }
  };

  const createMarkup = () => {
    let formatted = curLogText.replace(/\n/g, "<br/>");
    return { __html: formatted };
  };

  const renderLogView = () => {
    if (compStatus === CompileStatus.WAITING) {
      return (
        <div className={styles.logLoadingContainer}>
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.logContainer}>
        <div
          className={styles.logContent}
          id="logtext"
          dangerouslySetInnerHTML={createMarkup()}
        ></div>
      </div>
    );
  };

  const setPageNum = (pageNum: number) => {
    setNumPages(pageNum);
  };

  // https://stackoverflow.com/questions/76834748/react-pdf-gives-typeerror-cannot-read-properties-of-null-reading-sendwithprom
  const opt = useMemo(() => {
    return getPdfjsOptions();
  }, []);

  const renderPdfView = () => {
    if (!curPdfUrl || !props.projectId) {
      return <div>Loading...</div>;
    }
    return (
      <MemoizedPDFPreview
        curPdfUrl={curPdfUrl}
        projId={props.projectId}
        viewModel={props.viewModel}
        setPageNum={setPageNum}
        virtualListRef={virtualListRef}
        pdfOptions={opt}
        curPdfPage={props.curPage}
      ></MemoizedPDFPreview>
    );
  };

  const renderPreviewHeaderAction = () => {
    if (curPreviewTab === "pdfview") {
      return (
        <div className={styles.rightAction}>
          {!devModel ? (
            <div></div>
          ) : (
            <button
              className={styles.previewIconButton}
              data-bs-toggle="tooltip"
              title={t("btn_debug_app")}
              onClick={() => {}}
            >
              <i className="fa-solid fa-check"></i>
            </button>
          )}
          {!devModel ? (
            <div></div>
          ) : (
            <button
              className={styles.previewIconButton}
              data-bs-toggle="tooltip"
              title={t("btn_debug_app")}
              onClick={() => {
                debugApp(virtualListRef, props.projectId);
              }}
            >
              <i className="fa-solid fa-check"></i>
            </button>
          )}
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_restore_scroll")}
            onClick={() => {
              if (virtualListRef && virtualListRef.current) {
                restorePdfOffset(
                  props.projectId,
                  props.viewModel,
                  virtualListRef
                );
              }
            }}
          >
            <i className="fa-solid fa-hashtag"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_open_in_broswer")}
            onClick={() => {
              handleOpenInBrowserDirect(props.projectId);
            }}
          >
            <i className="fa-brands fa-chrome"></i>
          </button>
          {props.viewModel === "fullscreen" ? (
            <button
              className={styles.previewIconButton}
              data-bs-toggle="tooltip"
              title={t("btn_maximize")}
              onClick={() => {
                enterFullScreen();
              }}
            >
              <i className="fa-solid fa-expand"></i>
            </button>
          ) : null}
          {props.viewModel === "fullscreen" ? (
            <button
              className={styles.previewIconButton}
              data-bs-toggle="tooltip"
              title={t("btn_home")}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <i className="fa-solid fa-home"></i>
            </button>
          ) : null}
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_scroll_top")}
            onClick={() => {
              handleScrollTop(virtualListRef, props.projectId, props.viewModel);
            }}
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_nav_src")}
            onClick={() => {
              if (!BaseMethods.isNull(curProjInfo)) {
                handleSrcLocate(
                  props.projectId,
                  curProjInfo!,
                  t("msg_empty_proj_info")
                );
              }
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_download_pdf")}
            onClick={() => {
              handleDownloadPdf(curPdfUrl);
            }}
          >
            <i className="fa-solid fa-download"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_zoomin")}
            id="zoominbutton"
            onClick={() => {
              handleZoomIn();
            }}
          >
            <i className="fa fa-search-plus"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_zoomout")}
            id="zoomoutbutton"
            onClick={() => {
              handleZoomOut();
            }}
          >
            <i className="fa fa-search-minus"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_fullscreen")}
            id="fullscreenbutton"
            onClick={() => {
              handleFullScreen(curPage);
            }}
          >
            <i className="fa fa-maximize"></i>
          </button>
        </div>
      );
    }
    if (curPreviewTab === "logview") {
      return <div></div>;
    }
    return <div></div>;
  };

  const renderCompiled = (texCompileResult: CompileResultType) => {
    if (curCompileQueue && Object.keys(curCompileQueue).length > 0) {
      if (texCompileResult === CompileResultType.FAILED) {
        return <i className="fa-solid fa-bug text-danger"></i>;
      } else if (texCompileResult === CompileResultType.SUCCESS) {
        return <i className="fa-solid fa-square-check text-success"></i>;
      } else if (texCompileResult === CompileResultType.PROCESSING) {
        return <i className="fa-solid fa-spinner"></i>;
      }
    }
  };

  const handleNavPageChange = (e: any) => {
    let val = e.target.value;
    setAndDispatchPdfPage(val, props.projectId, "handleNavPageChange");
  };

  const renderPageNaviation = () => {
    return (
      <div className={styles.previewPageNav}>
        <input
          value={curPage || undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleNavPageChange(e);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const navPage = (event.target as HTMLInputElement).value;
              const tweakedPageNum = Number(navPage);
              if (tweakedPageNum >= 0 && tweakedPageNum < 10000) {
                scrollToPage(tweakedPageNum, virtualListRef);
              }
            }
          }}
        ></input>
        <div>/</div>
        <div>{numPages || 1}</div>
      </div>
    );
  };

  const renderLeftTab = () => {
    if (props.viewModel === "fullscreen") {
      return (
        <div className={styles.leftAction}>
          <button
            className={styles.previewButton}
            onClick={() => {
              setCurPreviewTab("pdfview");
            }}
          >
            <i className="fa-regular fa-file-pdf"></i> {t("tab_preview")}
          </button>
        </div>
      );
    }
    return (
      <div className={styles.leftAction}>
        <button
          className={styles.previewButton}
          onClick={() => {
            setCurPreviewTab("pdfview");
          }}
        >
          <i className="fa-regular fa-file-pdf"></i> {t("tab_preview")}
        </button>
        <button
          className={styles.previewButton}
          onClick={() => {
            setCurPreviewTab("logview");
          }}
        >
          <i className="fa-regular fa-file-lines"></i> {t("tab_log")}{" "}
          {renderCompiled(texCompileResult)}
        </button>
      </div>
    );
  };

  return (
    <div id="preview" className={styles.preview}>
      <div className={styles.previewHader}>
        {renderLeftTab()}
        {renderPageNaviation()}
        {renderPreviewHeaderAction()}
      </div>
      {renderPreviewTab()}
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default Previewer;
