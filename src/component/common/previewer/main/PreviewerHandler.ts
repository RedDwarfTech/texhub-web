import { ProjInfo } from "@/model/proj/ProjInfo";
import { QuerySrcPos } from "@/model/request/proj/query/QuerySrcPos";
import { getCurPdfPage } from "@/service/project/preview/PreviewService";
import {
  getSrcPosition,
  getTempAuthCode,
  sendQueueCompileRequest,
} from "@/service/project/ProjectService";
import { toast } from "react-toastify";
import { getAccessToken } from "../../cache/Cache";
import { getPreviewUrl } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { scrollToOffset } from "../doc/PDFPreviewHandle";
import { VariableSizeList } from "react-window";
import { readConfig } from "@/config/app/config-reader";
import { SocketIOClientProvider } from "texhub-broadcast";

/**
 * get the source location by pdf file position
 *
 * @returns src position info
 */
export const handleSrcLocate = (
  projectId: string,
  curProjInfo: ProjInfo,
  msg: string
) => {
  if (!projectId) {
    toast.info(msg);
    return;
  }
  let curPage = getCurPdfPage(projectId);
  let req: QuerySrcPos = {
    project_id: projectId,
    main_file: curProjInfo?.main_file.name || "main.tex",
    page: Number(curPage) || 1,
    h: 3.565,
    v: 4.563,
  };
  getSrcPosition(req);
};

export const handleOpenInBrowserDirect = (projectId: string) => {
  if (projectId) {
    getPreviewUrl(projectId).then((res) => {
      if (ResponseHandler.responseSuccess(res)) {
        window.open(res.result, "_blank");
      }
    });
  }
};

export const debugApp = (
  virtualListRef: React.RefObject<VariableSizeList>,
  projectId: string
) => {
  let offset = localStorage.getItem("pdfScrollOffset");
  if (offset) {
    const key = "default:" + readConfig("pdfScrollKey") + projectId;
    let defaultScroll = localStorage.getItem(key);
    console.log("defaultScroll:" + defaultScroll);
    const keyFullscreen =
      "fullscreen:" + readConfig("pdfScrollKey") + projectId;
    let fullScroll = localStorage.getItem(keyFullscreen);
    console.log("fullScroll:" + fullScroll);
    scrollToOffset(parseInt(offset), virtualListRef, projectId);
  }
};

export const handleOpenInBrowser = (projectId: string) => {
  if (projectId) {
    let accessToken = getAccessToken();
    let url = "/tex/file/pdf/full?proj_id=" + projectId;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        var _url = window.URL.createObjectURL(blob);
        window.open(_url, "_blank")!.focus();
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export const handleDownloadPdf = async (pdfUrl: string) => {
  if (!pdfUrl) {
    toast.error("PDF文件Url为空");
    return;
  }
  try {
    let accessToken = getAccessToken();
    const response = await fetch(pdfUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
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

export const compile = (prj_id: string) => {
  getTempAuthCode().then((resp) => {
    if (ResponseHandler.responseSuccess(resp)) {
      let params = {
        project_id: prj_id,
      };
      sendQueueCompileRequest(params).then((resp) => {
        if (ResponseHandler.responseSuccess(resp)) {
        }
      });
    } else {
      toast.error(resp.msg);
    }
  });
};
