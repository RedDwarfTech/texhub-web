import {
  getProjectList,
  uploadProject,
} from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { toast } from "react-toastify";
import { UserService } from "rd-component";
import { useTranslation } from "react-i18next";
import React from "react";
import { getProjFilter } from "../../tab/ProjectTabEventHandler";

export type UploadProjProps = {};

const TeXUploadProj: React.FC<UploadProjProps> = (props: UploadProjProps) => {
  const fileInput = React.createRef<HTMLInputElement>();
  const { t } = useTranslation();

  const handleProjUpload = () => {
    if (!UserService.isLoggedIn()) {
      toast.warning(t("tips_need_login"));
      return;
    }
    if (
      fileInput &&
      fileInput.current &&
      fileInput.current.files &&
      fileInput.current.files.length === 1
    ) {
      const uploadFile = fileInput.current.files[0];
      uploadProject(uploadFile).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          getProjectList(getProjFilter({}));
        } else {
          toast.error(t("tips_upload_failed"));
        }
      });
    }
  };

  return (
    <div>
      <div className="modal" id="uploadProj" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("title_new_proj")}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div>
                <input
                  className="form-control form-control-md"
                  id="formFileLg"
                  ref={fileInput}
                  type="file"
                  // https://stackoverflow.com/questions/33247452/bootstrap-file-input-limit-file-types
                  accept=".zip"
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
                  handleProjUpload();
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

export default TeXUploadProj;
