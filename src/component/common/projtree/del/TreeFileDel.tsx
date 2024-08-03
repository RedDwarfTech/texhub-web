import { TexFileModel } from "@/model/file/TexFileModel";
import "antd/lib/tree/style";
import React from "react";
import { toast } from "react-toastify";
import { delTreeItem, getFileTree } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { useTranslation } from "react-i18next";

export type TreeFileRenameProps = {
  projectId: string;
  operFile: TexFileModel;
};

const TreeFileDel: React.FC<TreeFileRenameProps> = (
  props: TreeFileRenameProps
) => {
  const { t } = useTranslation();

  const handleFileDelete = () => {
    if (!props.operFile) {
      toast.error("请先选择要删除的文件");
      return;
    }
    let params = {
      file_id: props.operFile?.file_id,
    };
    delTreeItem(params).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        getFileTree(props.projectId.toString());
      }
    });
  };

  return (
    <div
      className="modal fade"
      id="deleteFileModal"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="deleteModalLabel">
              {t("title_del")}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="input-group flex-nowrap">
              {t("tips_delete")}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {t("btn_del")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={() => {
                handleFileDelete();
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

export default TreeFileDel;
