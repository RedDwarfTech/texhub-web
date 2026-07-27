import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppState } from "@/redux/types/AppState";
import OutlineTree from "@/component/common/previewer/feat/outline/OutlineTree";
import { requestOutlineNavigation } from "@/service/project/preview/PreviewService";
import styles from "./ProjectOutlinePanel.module.css";

const ProjectOutlinePanel: React.FC = () => {
  const { t } = useTranslation();
  const pdfOutline = useSelector((state: AppState) => state.preview.pdfOutline);
  const activeOutline = useSelector(
    (state: AppState) => state.preview.activeOutline
  );

  const handleOutlineClick = (dest: unknown) => {
    requestOutlineNavigation(dest);
  };

  return (
    <div className={styles.outlinePanel}>
      <div className={styles.outlineHeader}>{t("title_pdf_outline")}</div>
      {pdfOutline.length === 0 ? (
        <div className={styles.outlineEmpty}>{t("tips_pdf_outline_empty")}</div>
      ) : (
        <div className={styles.outlineScroll}>
          <OutlineTree
            theme="sidebar"
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

export default ProjectOutlinePanel;
