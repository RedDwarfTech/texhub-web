import { TexFileModel } from "@/model/file/TexFileModel";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { AppState } from "@/redux/types/AppState";
import {
  getProjectInfo,
  uploadProjectFile,
} from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export type TreeUploadProps = {
  projectId: string;
};

const TreeUpload: React.FC<TreeUploadProps> = (props: TreeUploadProps) => {
  const fileInput = React.createRef<HTMLInputElement>();
  const { treeSelectItem } = useSelector((state: AppState) => state.file);
  const selected = localStorage.getItem("proj-select-file:" + props.projectId);
  const [selectedFile, setSelectedFile] = useState<TexFileModel>(
    selected ? JSON.parse(selected) : null
  );
  const { t } = useTranslation();

  React.useEffect(() => {
    setSelectedFile(treeSelectItem);
  }, [treeSelectItem]);

  const handleOk = () => {
    if (
      fileInput &&
      fileInput.current &&
      fileInput.current.files &&
      fileInput.current.files.length > 0
    ) {
      const uploadFile = fileInput.current?.files[0];
      if (!selectedFile || selectedFile.file_id === undefined) {
        toast.warn("请选择文件上传位置");
        return;
      }
      if (!uploadFile) {
        toast.warn("请选择文件上传文件");
        return;
      }
      if (uploadFile.size > 1024*1024) {
        toast.warn("超出文件大小限制");
        return;
      }
      if (uploadFile.size) {
        uploadProjectFile(
          uploadFile,
          props.projectId,
          selectedFile.file_id
        ).then((res) => {
          if (ResponseHandler.responseSuccess(res)) {
            let query: QueryProjInfo = {
              project_id: props.projectId,
            };
            getProjectInfo(query);
          }
        });
      }
    }
  };

  return (
    <div
      className="modal fade"
      id="uploadFileModal"
      aria-labelledby="uploadModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="uploadModalLabel">
              上传文件
            </h5>
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
                handleOk();
              }}
            >
              {t("btn_confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeUpload;
