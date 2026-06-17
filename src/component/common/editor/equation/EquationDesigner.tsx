import React from "react";
import { useTranslation } from "react-i18next";

export type EquationDesignerProps = {};

const EquationDesigner: React.FC<EquationDesignerProps> = (
  props: EquationDesignerProps
) => {
  const { t } = useTranslation();

  return (
    <div
      className="modal fade"
      id="equationDesignerModal"
      aria-labelledby="equationDesignerLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="tableDesignerLabel">
              {t("title_equation_designer_alpha")}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <a target="_blank" href="https://www.latexlive.com/home">{t("doc_link_latexlive")}</a>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={() => {}}
            >
              {t("btn_confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquationDesigner;
