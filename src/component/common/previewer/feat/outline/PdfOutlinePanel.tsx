import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppState } from "@/redux/types/AppState";
import OutlineTree from "./OutlineTree";
import { requestOutlineNavigation, setAndDispatchActiveOutline } from "@/service/project/preview/PreviewService";
import styles from "./PdfOutlinePanel.module.css";

export type PdfOutlinePanelProps = {
  /** 项目树侧栏 vs 全屏预览左侧 */
  variant?: "sidebar" | "fullscreen";
};

const PdfOutlinePanel: React.FC<PdfOutlinePanelProps> = ({
  variant = "sidebar",
}) => {
  const { t } = useTranslation();
  const pdfOutline = useSelector((state: AppState) => state.preview.pdfOutline);
  const activeOutline = useSelector(
    (state: AppState) => state.preview.activeOutline
  );
  const theme = variant === "sidebar" ? "sidebar" : "default";
  const panelClass =
    variant === "sidebar" ? styles.outlinePanelSidebar : styles.outlinePanelFullscreen;

  const handleOutlineClick = (
    dest: unknown,
    key: string,
    ancestorKeys: string[]
  ) => {
    if (key) {
      setAndDispatchActiveOutline({ key, ancestorKeys });
    }
    requestOutlineNavigation(dest, key, ancestorKeys);
  };

  return (
    <div className={panelClass}>
      <div
        className={
          variant === "sidebar"
            ? styles.outlineHeaderSidebar
            : styles.outlineHeaderFullscreen
        }
      >
        {t("title_pdf_outline")}
      </div>
      {pdfOutline.length === 0 ? (
        <div
          className={
            variant === "sidebar"
              ? styles.outlineEmptySidebar
              : styles.outlineEmptyFullscreen
          }
        >
          {t("tips_pdf_outline_empty")}
        </div>
      ) : (
        <div className={styles.outlineScroll}>
          <OutlineTree
            theme={theme}
            outline={pdfOutline}
            onItemClick={handleOutlineClick}
            activeNodeKey={activeOutline.key}
            expandKeys={activeOutline.ancestorKeys}
          />
        </div>
      )}
    </div>
  );
};

export default PdfOutlinePanel;
