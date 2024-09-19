import React, { ChangeEvent, useRef, useState } from "react";
import styles from "./Previewer.module.css";
import { ToastContainer, toast } from "react-toastify";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import MemoizedPDFPreview from "./doc/MemoizedPDFPreview";
import MemoPDFPreview from "./doc/MemoPDFPreview";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { Options } from "react-pdf/dist/cjs/shared/types";
import { getAccessToken } from "../cache/Cache";
import {
  getLatestCompile,
  setProjAttr,
} from "@/service/project/ProjectService";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { BaseMethods } from "rdjs-wheel";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { scrollToPage } from "./doc/PDFPreviewHandle";
import { useTranslation } from "react-i18next";
import { handleSrcLocate } from "./PreviewerHandler";
import { VariableSizeList } from "react-window";
import {
  getCurPdfPage,
  setCurPdfPage,
} from "@/service/project/preview/PreviewService";
import { getCurPdfScrollOffset } from "@/service/project/preview/PreviewService";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/${pdfjs.version}/legacy/pdf.worker.min.mjs`;

export type PreviwerProps = {
  projectId: string;
  viewModel: string;
};

const Previewer: React.FC<PreviwerProps> = ({ projectId, viewModel }) => {
  const [curPdfUrl, setCurPdfUrl] = useState<string>("");
  const [compStatus, setCompStatus] = useState<CompileStatus>(
    CompileStatus.COMPLETE
  );
  const [curLogText, setCurLogText] = useState<string>("");
  const [curPreviewTab, setCurPreviewTab] = useState<string>("pdfview");
  const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
  const [curCompileQueue, setCurCompileQueue] = useState<CompileQueue>();
  const [numPages, setNumPages] = useState<number>();
  const [curPages, setCurPages] = useState<number>();
  const { curPage } = useSelector((state: AppState) => state.preview);
  const {
    pdfUrl,
    streamLogText,
    logText,
    tabName,
    compileStatus,
    queue,
    latestComp,
    projInfo,
  } = useSelector((state: AppState) => state.proj);
  const { t } = useTranslation();
  const virtualListRef = useRef<VariableSizeList>(null);

  const options: Options = {
    cMapUrl: `/pdfjs-dist/${pdfjs.version}/cmaps/`,
    httpHeaders: {
      Authorization: "Bearer " + getAccessToken(),
    },
    // open the range request
    // the default value was false
    // if want to load the whole pdf by default
    // set this value to true
    disableRange: false,
    // just fetch the needed slice
    disableAutoFetch: true,
    rangeChunkSize: 65536 * 5,
  };

  React.useEffect(() => {
    getLatestCompile(projectId);
  }, [projectId]);

  React.useEffect(() => {
    if (curPage && curPage >= 0) {
      setCurPages(curPage);
    } else {
      let cp = getCurPdfPage(projectId);
      setCurPages(cp);
    }
  }, [curPage]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setCurProjInfo(projInfo);
    }
  }, [projInfo]);

  React.useEffect(() => {
    if (latestComp && Object.keys(latestComp).length > 0) {
      if (latestComp.path && latestComp.path.length > 0) {
        let newPdfUrl = "/tex/file/pdf/partial?proj_id=" + projectId;
        setCurPdfUrl(newPdfUrl);
      }
    }
  }, [latestComp]);

  React.useEffect(() => {
    if (pdfUrl && pdfUrl.length > 0) {
      setCurPdfUrl(pdfUrl);
    }
  }, [pdfUrl]);

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
      if (streamLogText === "====CLEAR====") {
        setCurLogText("");
        return;
      }
      setCompStatus(CompileStatus.COMPILING);
      setCurLogText((prevState) => {
        let newLogText =
          prevState && prevState.length > 0
            ? prevState + "<br/>" + streamLogText
            : prevState + streamLogText;
        return newLogText;
      });
    }
  }, [streamLogText]);

  const handleDownloadPdf = async (pdfUrl: string) => {
    if (!pdfUrl) {
      toast.error("PDF文件Url为空");
      return;
    }
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", new Date().getTime() + ".pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleScrollTop = () => {
    const pdfContainerDiv = document.getElementById("pdfContainer");
    if (pdfContainerDiv) {
      pdfContainerDiv.scrollTop = 0;
    }
  };

  const handleOpenInBrowser = (curPdfUrl: string) => {
    const pdfContainerDiv = document.getElementById("pdfContainer");
    if (pdfContainerDiv) {
      window.open(curPdfUrl, "_blank");
    }
  };

  const handleZoomIn = async () => {
    if (!projectId) {
      toast.warn("未找到当前项目信息");
      return;
    }
    let cachedScale = localStorage.getItem("pdf:scale:" + projectId);
    let numberScale = Number(cachedScale);
    let curScale;
    if (numberScale > 5) {
      curScale = 5;
    } else {
      curScale = numberScale + 0.1;
    }
    let offset = getCurPdfScrollOffset(projectId);
    let newOffset =
      Number(offset) + (curScale - Number(cachedScale)) * Number(offset);
    setProjAttr({
      pdfScale: curScale,
      legacyPdfScale: Number(cachedScale),
      pdfOffset: newOffset
    });
    localStorage.setItem("pdf:scale:" + projectId, curScale.toString());
  };

  const handleZoomOut = async () => {
    if (!projectId) {
      toast.warn("未找到当前项目信息");
      return;
    }
    let cachedScale = localStorage.getItem("pdf:scale:" + projectId);
    let numberScale = Number(cachedScale);
    let curScale;
    if (numberScale < 0.2) {
      curScale = 0.2;
    } else {
      curScale = numberScale - 0.1;
    }
    localStorage.setItem("pdf:scale:" + projectId, curScale.toString());
    let offset = getCurPdfScrollOffset(projectId);
    let newOffset =
      Number(offset) + (curScale - Number(cachedScale)) * Number(offset);
    setProjAttr({ 
      pdfScale: curScale, 
      legacyPdfScale: Number(cachedScale),
      pdfOffset: newOffset
     });
  };

  const handleFullScreen = async () => {
    if (!projectId) {
      toast.warn("未找到当前项目信息");
      return;
    }
    let url = "/preview/fullscreen?projId=" + projectId;
    window.open(url, "_blank", "noopener,noreferrer");
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
    let formatted = curLogText?.replace(/\n/g, "<br/>");
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

  const renderPdfView = () => {
    if (!curPdfUrl || !projectId) return <div>Loading...</div>;
    return (
      <MemoizedPDFPreview
        curPdfUrl={curPdfUrl}
        projId={projectId}
        viewModel={viewModel}
        setPageNum={setPageNum}
        options={options}
        virtualListRef={virtualListRef}
      ></MemoizedPDFPreview>
    );
  };

  const renderPreviewHeaderAction = () => {
    if (curPreviewTab === "pdfview") {
      return (
        <div className={styles.rightAction}>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_open_in_broswer")}
            onClick={() => {
              handleOpenInBrowser(curPdfUrl);
            }}
          >
            <i className="fa-brands fa-chrome"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title={t("btn_scroll_top")}
            onClick={() => {
              handleScrollTop();
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
                handleSrcLocate(projectId, curProjInfo!);
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
              handleFullScreen();
            }}
          >
            <i className="fa fa-expand"></i>
          </button>
        </div>
      );
    }
    if (curPreviewTab === "logview") {
      return <div></div>;
    }
    return <div></div>;
  };

  const renderCompiled = () => {
    if (curCompileQueue && Object.keys(curCompileQueue).length > 0) {
      if (curCompileQueue.comp_result === CompileResultType.FAILED) {
        return <i className="fa-solid fa-bug text-danger"></i>;
      } else if (curCompileQueue.comp_result === CompileResultType.SUCCESS) {
        return <i className="fa-solid fa-square-check text-success"></i>;
      }
    }
  };

  const handleNavPageChange = (e: any) => {
    let val = e.target.value;
    setCurPdfPage(val, projectId);
  };

  const renderPageNaviation = () => {
    return (
      <div className={styles.previewPageNav}>
        <input
          value={curPages}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleNavPageChange(e);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const navPage = (event.target as HTMLInputElement).value;
              scrollToPage(Number(navPage), virtualListRef);
            }
          }}
        ></input>
        <div>/</div>
        <div>{numPages}</div>
      </div>
    );
  };

  const renderLeftTab = () => {
    if (viewModel === "fullscreen") {
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
          {renderCompiled()}
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
