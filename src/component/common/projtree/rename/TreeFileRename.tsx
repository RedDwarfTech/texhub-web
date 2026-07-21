import { TexFileModel } from "@/model/file/TexFileModel";
import {
  getFileTree,
  renameFileImpl,
} from "@/service/file/FileService";
import { useState } from "react";
import "antd/lib/tree/style";
import React from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { RenameFile } from "@/model/request/file/edit/RenameFile";
import { ResponseHandler } from "rdjs-wheel";

export type TreeFileRenameProps = {
  projectId: string;
  operFile: TexFileModel;
};

const TreeFileRename: React.FC<TreeFileRenameProps> = (
  props: TreeFileRenameProps
) => {
  const [renameFile, setRenameFile] = useState<TexFileModel>(props.operFile);
  const { t } = useTranslation();

  React.useEffect(() =>{
    if(props.operFile){
      setRenameFile(props.operFile);
    }
  },[props.operFile]);

  const handleRenameFile = () => {
    if (!renameFile || !props.operFile) {
      toast.warn(t("tips_input_file_new_name"));
      return;
    }
    const trimmedName = renameFile.name.trim();
    if (!trimmedName) {
      toast.warn(t("tips_input_file_new_name"));
      return;
    }
    let req: RenameFile = {
      file_id: renameFile.file_id,
      name: trimmedName,
      legacy_name: props.operFile.name,
    };
    renameFileImpl(req).then((res) => {
      if (ResponseHandler.responseSuccess(res)) {
        getFileTree(props.projectId.toString());
      }
    });
  };

  const handleRenameFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!renameFile) {
      return;
    }
    let newFile: TexFileModel = {
      ...renameFile,
      name: event.target.value,
    };
    setRenameFile(newFile);
  };

  return (
    <div
      className="modal fade"
      id="renameFileModal"
      aria-labelledby="renameModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="renameModalLabel">
              {t("title_rename")}
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
              <input
                id="folderName"
                type="text"
                onChange={handleRenameFileChange}
                className="form-control"
                placeholder={t("tips_new_name")}
                aria-label="Username"
                value={renameFile ? renameFile.name : ""}
                aria-describedby="addon-wrapping"
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
                handleRenameFile();
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

export default TreeFileRename;
