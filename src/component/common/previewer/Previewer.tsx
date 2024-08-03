import React, { ChangeEvent, useState } from "react";
import styles from "./Previewer.module.css";
import { ToastContainer, toast } from "react-toastify";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import MemoizedPDFPreview from "./doc/MemoizedPDFPreview";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { Options } from "react-pdf/dist/cjs/shared/types";
import { getAccessToken } from "../cache/Cache";
import {
  getLatestCompile,
  getSrcPosition,
  setProjAttr,
} from "@/service/project/ProjectService";
import { QuerySrcPos } from "@/model/request/proj/query/QuerySrcPos";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { readConfig } from "@/config/app/config-reader";
import { BaseMethods } from "rdjs-wheel";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { goPage } from "./doc/PDFPreviewHandle";
import { useTranslation } from "react-i18next";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/${pdfjs.version}/pdf.worker.min.mjs`;

export type PreviwerProps = {
  projectId: string;
  viewModel: string;
};

const options: Options = {
  cMapUrl: `/pdfjs-dist/${pdfjs.version}/cmaps/`,
  httpHeaders: {
    Authorization: "Bearer " + getAccessToken(),
  },
};

const Previewer: React.FC<PreviwerProps> = ({ projectId, viewModel }) => {
  let cachedScale = localStorage.getItem("pdf:scale:" + projectId);
  let scaleNum = Number(cachedScale ?? 1);
  const [pdfScale, setPdfScale] = useState<number>(scaleNum ?? 1);
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
  const {
    pdfUrl,
    streamLogText,
    logText,
    tabName,
    compileStatus,
    queue,
    projAttr,
    latestComp,
    projInfo,
  } = useSelector((state: AppState) => state.proj);
  const { t } = useTranslation();

  React.useEffect(() => {
    getLatestCompile(projectId);
  }, [projectId]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setCurProjInfo(projInfo);
    }
  }, [projInfo]);

  React.useEffect(() => {
    if (latestComp && Object.keys(latestComp).length > 0) {
      if (latestComp.path && latestComp.path.length > 0) {
        let combinedPdfUrl = BaseMethods.joinUrl(
          readConfig("compileBaseUrl"),
          latestComp.path
        );
        setCurPdfUrl(combinedPdfUrl);
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
    if (projAttr.pdfScale === 1 && pdfScale !== 1) {
      return;
    }
    setPdfScale(projAttr.pdfScale);
  }, [projAttr, pdfScale]);

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

  /**
   * get the source location by pdf file position
   * @returns src position info
   */
  const handleSrcLocate = () => {
    if (!projectId) {
      toast.info("项目信息为空");
      return;
    }
    let curPage = localStorage.getItem(readConfig("pdfCurPage") + projectId);
    let req: QuerySrcPos = {
      project_id: projectId,
      main_file: curProjInfo?.main_file.name || "main.tex",
      page: Number(curPage) || 1,
      h: 3.565,
      v: 4.563,
    };
    getSrcPosition(req);
  };

  const handleZoomIn = async () => {
    if (!projectId) {
      toast.warn("未找到当前项目信息");
      return;
    }
    let curScale = pdfScale + 0.1;
    setProjAttr({ pdfScale: curScale });
    localStorage.setItem("pdf:scale:" + projectId, curScale.toString());
  };

  const handleZoomOut = async () => {
    if (!projectId) {
      toast.warn("未找到当前项目信息");
      return;
    }
    let curScale = pdfScale - 0.1;
    setProjAttr({ pdfScale: curScale });
    localStorage.setItem("pdf:scale:" + projectId, curScale.toString());
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

  const setCurNum = (curPageNum: number) => {
    setCurPages(curPageNum);
  };

  const renderPdfView = () => {
    if (!curPdfUrl || !projectId) return <div>Loading...</div>;
    return (
      <MemoizedPDFPreview
        curPdfUrl={curPdfUrl}
        projId={projectId}
        viewModel={viewModel}
        setPageNum={setPageNum}
        setCurPageNum={setCurNum}
        options={options}
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
            title="浏览器中打开"
            onClick={() => {
              handleOpenInBrowser(curPdfUrl);
            }}
          >
            <i className="fa-brands fa-chrome"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title="滚动到顶部"
            onClick={() => {
              handleScrollTop();
            }}
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title="导航到源码"
            onClick={() => {
              handleSrcLocate();
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title="下载PDF"
            onClick={() => {
              handleDownloadPdf(curPdfUrl);
            }}
          >
            <i className="fa-solid fa-download"></i>
          </button>
          <button
            className={styles.previewIconButton}
            data-bs-toggle="tooltip"
            title="放大"
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
            title="缩小"
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
            title="全屏"
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
    setCurPages(val);
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
              goPage(Number(navPage));
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
          <i className="fa-regular fa-file-lines"></i> 日志 {renderCompiled()}
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
