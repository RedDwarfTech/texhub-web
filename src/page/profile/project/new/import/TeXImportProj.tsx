import {
  getProjectList,
  importGitHubProject,
} from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { toast } from "react-toastify";
import { UserService } from "rd-component";
import { useTranslation } from "react-i18next";
import React from "react";
import { getProjFilter } from "../../tab/ProjectTabEventHandler";
import styles from "./TeXImportProj.module.css";
import { ProjTabType } from "@/model/proj/config/ProjTabType";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";

export type UploadProjProps = {};

const TeXImportProj: React.FC<UploadProjProps> = (props: UploadProjProps) => {
  const urlInput = React.createRef<HTMLInputElement>();
  const mainFileInput = React.createRef<HTMLInputElement>();
  const { t } = useTranslation();

  const handleProjImport = () => {
    if (!UserService.isLoggedIn()) {
      toast.warning(t("tips_need_login"));
      return;
    }
    let url = urlInput.current?.value;
    let mainFile = mainFileInput.current?.value;
    if (url && mainFile) {
      importGitHubProject(url, mainFile).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          let query: QueryProjReq = getProjFilter({}, ProjTabType.All);
          getProjectList(query);
        } else {
          toast.error(t("tips_import_failed"));
        }
      });
    }
  };

  return (
    <div>
      <div className="modal" id="importProj" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("title_import_proj")}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className={styles.cloneInfo}>
                <input
                  className="form-control form-control-md"
                  id="formUrl"
                  ref={urlInput}
                  placeholder={t("tips_enter_github_url")}
                />
                <input
                  className="form-control form-control-md"
                  id="formMainFile"
                  ref={mainFileInput}
                  defaultValue={"main.tex"}
                  placeholder={t("tips_enter_main")}
                />
              </div>
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
                onClick={() => {
                  handleProjImport();
                }}
              >
                {t("btn_confirm")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeXImportProj;
