import {
  getCurPdfScale,
  setCurPdfScale,
  setCurPdfScrollOffset,
} from "@/service/project/preview/PreviewService";
import { setProjAttr } from "@/service/project/ProjectService";
import { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { scrollToOffset } from "../doc/PDFPreviewHandle";
import { ListImperativeAPI } from "react-window";

export const usePreviewHandler = (
  projectId: string,
  viewModel: string,
  virtualListRef: RefObject<ListImperativeAPI | null>
) => {
  const { t } = useTranslation();

  const persistScrollBeforeZoom = () => {
    const scrollEl = virtualListRef.current?.element;
    if (scrollEl) {
      setCurPdfScrollOffset(scrollEl.scrollTop, projectId, "handleZoom");
    }
  };

  const applyZoom = (newScale: number, oldScale: number) => {
    persistScrollBeforeZoom();
    setCurPdfScale(newScale, projectId, viewModel);
    setProjAttr({
      pdfScale: newScale,
      legacyPdfScale: oldScale,
    });
  };

  const handleScrollTop = (
    virtualListRef: React.RefObject<ListImperativeAPI>,
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
    const oldScale = Number(getCurPdfScale(projectId, viewModel));
    const newScale = oldScale >= 5 ? 5 : oldScale + 0.1;
    if (newScale === oldScale) {
      return;
    }
    applyZoom(newScale, oldScale);
  };

  const handleZoomOut = async () => {
    if (!projectId) {
      toast.warn(t("msg_empty_proj_info"));
      return;
    }
    const oldScale = Number(getCurPdfScale(projectId, viewModel));
    const newScale = oldScale <= 0.2 ? 0.2 : oldScale - 0.1;
    if (newScale === oldScale) {
      return;
    }
    applyZoom(newScale, oldScale);
  };

  return {
    handleScrollTop,
    handleZoomIn,
    handleFullScreen,
    handleZoomOut,
  };
};
