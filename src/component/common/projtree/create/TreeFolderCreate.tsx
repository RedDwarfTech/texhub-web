import { TexFileModel } from "@/model/file/TexFileModel";
import { addFile, getFileTree } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export type TreeFolderCreateProps = {
  projectId: string;
  selectedFile: TexFileModel;
};

const TreeFolderCreate: React.FC<TreeFolderCreateProps> = (
  props: TreeFolderCreateProps
) => {
  const pid = props.projectId;
  const [folderName, setFolderName] = useState("");
  const { t } = useTranslation();

  const getParentId = (): string => {
    if (!props.selectedFile) {
      toast.warn("请选择目录位置");
      return "";
    }
    if (props.selectedFile.file_type === 0) {
      return props.selectedFile.file_id;
    } else {
      return props.selectedFile.parent;
    }
  };

  const handleFolderAddConfirm = () => {
    if (!folderName || folderName.length === 0) {
      toast.warn("请输入文件夹名称");
      return;
    }
    let parentId = getParentId();
    if (!parentId || parentId.length === 0) {
      toast.warn("请选择文件夹创建位置");
      return;
    }
    let params = {
      name: folderName,
      project_id: pid,
      parent: parentId,
      file_type: 0,
    };
    addFile(params).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        getFileTree(pid?.toString());
      } else {
        toast.error(resp.msg);
      }
    });
  };

  const handleInputChange = (event: any) => {
    setFolderName(event.target.value);
  };

  return (
    <div
      className="modal fade"
      id="createFolderModal"
      aria-labelledby="createFolderModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="createFolderModalLabel">
              {t("title_create_folder")}
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
                onChange={handleInputChange}
                className="form-control"
                placeholder={t("tips_folder_name")}
                aria-label="Username"
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
                handleFolderAddConfirm();
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

export default TreeFolderCreate;
