import { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { scrollToOffset } from "../doc/PDFPreviewHandle";
import { ListImperativeAPI } from "react-window";
import { PDFPreviewZoomHandle } from "@/model/props/proj/pdf/PDFPreviewZoomHandle";

export const usePreviewHandler = (
  projectId: string,
  _viewModel: string,
  virtualListRef: RefObject<ListImperativeAPI | null>,
  pdfPreviewRef: RefObject<PDFPreviewZoomHandle | null>
) => {
  const { t } = useTranslation();

  const handleScrollTop = (
    listRef: React.RefObject<ListImperativeAPI>,
    projId: string
  ) => {
    if (listRef && listRef.current) {
      scrollToOffset(0, listRef, projId);
    }
  };

  const handleFullScreen = async (curPage: number) => {
    if (!projectId) {
      toast.warn(t("msg_empty_proj_info"));
      return;
    }
    const url =
      "/preview/fullscreen?projId=" + projectId + "&curPage=" + curPage;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleZoomIn = () => {
    if (!projectId) {
      toast.warn(t("msg_empty_proj_info"));
      return;
    }
    pdfPreviewRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    if (!projectId) {
      toast.warn(t("msg_empty_proj_info"));
      return;
    }
    pdfPreviewRef.current?.zoomOut();
  };

  return {
    handleScrollTop,
    handleZoomIn,
    handleFullScreen,
    handleZoomOut,
  };
};
