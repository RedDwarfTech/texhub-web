import {
  getCurPdfScale,
  setCurPdfScale,
} from "@/service/project/preview/PreviewService";
import { setProjAttr } from "@/service/project/ProjectService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { scrollToOffset } from "../doc/PDFPreviewHandle";
import { VariableSizeList } from "react-window";

export const usePreviewHandler = (projectId: string, viewModel: string) => {
  const { t } = useTranslation();

  const handleScrollTop = (
    virtualListRef: React.RefObject<VariableSizeList>,
    projId: string,
    viewModel: string
  ) => {
    if (virtualListRef && virtualListRef.current) {
      scrollToOffset(0, virtualListRef, projectId);
    }
  };

  const handleFullScreen = async (curPage: number) => {
    if (!projectId) {
      toast.warn(t("msg_empty_proj_info"));
      return;
    }
    let url = "/preview/fullscreen?projId=" + projectId + "&curPage=" + curPage;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleZoomIn = async () => {
    if (!projectId) {
      toast.warn(t("msg_empty_proj_info"));
      return;
    }
    let cachedScale = getCurPdfScale(projectId, viewModel);
    let numberScale = Number(cachedScale);
    let curScale;
    if (numberScale > 5) {
      curScale = 5;
    } else {
      curScale = numberScale + 0.1;
    }
    setCurPdfScale(curScale, projectId, viewModel);
    setProjAttr({
      pdfScale: curScale,
      legacyPdfScale: Number(cachedScale),
    });
  };

  const handleZoomOut = async () => {
    if (!projectId) {
      toast.warn(t("msg_empty_proj_info"));
      return;
    }
    let cachedScale = getCurPdfScale(projectId, viewModel);
    let numberScale = Number(cachedScale);
    let curScale;
    if (numberScale < 0.2) {
      curScale = 0.2;
    } else {
      curScale = numberScale - 0.1;
    }
    setCurPdfScale(curScale, projectId, viewModel);
    setProjAttr({
      pdfScale: curScale,
      legacyPdfScale: Number(cachedScale),
    });
  };

  return {
    handleScrollTop,
    handleZoomIn,
    handleFullScreen,
    handleZoomOut,
  };
};
