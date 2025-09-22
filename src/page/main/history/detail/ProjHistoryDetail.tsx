import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import React, { useRef, useState } from "react";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import OmsSyntaxHighlight from "./OmsSyntaxHighlight";
import { useTranslation } from "react-i18next";

// Helper function to copy text to clipboard
const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};

export type HistoryProps = {
  projectId: string;
};

const ProjHistoryDetail: React.FC<HistoryProps> = (props: HistoryProps) => {
  const { curHistory } = useSelector((state: AppState) => state.proj);
  const [currentHistory, setCurrentHistory] = useState<ProjHisotry>();
  const delProjCancelRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    setCurrentHistory(curHistory);
  }, [curHistory]);

  return (
    <div
      className="modal"
      id="projHistoryDetail"
      tabIndex={-1}
      data-bs-backdrop="false"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t("title_version_detail")}</h5>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              style={{ fontSize: "0.9rem" }}
              onClick={() => {
                if (currentHistory?.content) copyToClipboard(currentHistory.content);
              }}
              title={t("btn_copy") || "Copy"}
            >
              {t("btn_copy") || "Copy"}
            </button>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <React.Suspense fallback={<div>Loading...</div>}>
              <OmsSyntaxHighlight
                textContent={currentHistory?.content!}
                language={"tex"}
              />
            </React.Suspense>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              ref={delProjCancelRef}
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjHistoryDetail;
