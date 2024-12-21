import {
  getCurPdfScale,
  setCurPdfScale,
} from "@/service/project/preview/PreviewService";
import { setProjAttr } from "@/service/project/ProjectService";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const usePreviewHandler = (projectId: string, viewModel: string) => {
  const { t } = useTranslation();

  const handleScrollTop = () => {
    const pdfContainerDiv = document.getElementById("pdfContainer");
    if (pdfContainerDiv) {
      pdfContainerDiv.scrollTop = 0;
    }
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

  return {
    handleScrollTop,
    handleZoomIn,
  };
};
