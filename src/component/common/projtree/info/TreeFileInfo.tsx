import { TexFileModel } from "@/model/file/TexFileModel";
import { TexFileInfoModel } from "@/model/file/TexFileInfoModel";
import { getFileDetail } from "@/service/file/FileService";
import { TeXFileType } from "@/model/enum/TeXFileType";
import { useState } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { ResponseHandler } from "rdjs-wheel";
import dayjs from "dayjs";

export type TreeFileInfoProps = {
  operFile: TexFileModel;
};

const TreeFileInfo: React.FC<TreeFileInfoProps> = (props: TreeFileInfoProps) => {
  const [fileInfo, setFileInfo] = useState<TexFileInfoModel>();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (props.operFile && props.operFile.file_id) {
      getFileDetail(props.operFile.file_id).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          setFileInfo(res.result as TexFileInfoModel);
        }
      });
    }
  }, [props.operFile]);

  const formatTime = (time: string) => {
    if (!time) {
      return "-";
    }
    return dayjs(Number(time)).format("YYYY-MM-DD HH:mm:ss");
  };

  const getFileTypeLabel = (fileType: number) => {
    if (fileType === TeXFileType.TEX) {
      return t("label_type_tex");
    }
    if (fileType === TeXFileType.FOLDER) {
      return t("label_type_folder");
    }
    return fileType;
  };

  return (
    <div
      className="modal fade"
      id="fileInfoModal"
      aria-labelledby="fileInfoModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="fileInfoModalLabel">
              {t("title_file_info")}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {fileInfo ? (
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td className="text-muted">{t("label_file_name")}</td>
                    <td>{fileInfo.name}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t("label_creator")}</td>
                    <td>
                      {fileInfo.nickname || fileInfo.user_id || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t("label_create_time")}</td>
                    <td>{formatTime(fileInfo.created_time)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t("label_update_time")}</td>
                    <td>{formatTime(fileInfo.updated_time)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t("label_file_type")}</td>
                    <td>{getFileTypeLabel(fileInfo.file_type)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t("label_file_path")}</td>
                    <td>{fileInfo.file_path || "-"}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="text-center text-muted">{t("tips_loading")}</div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {t("btn_close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeFileInfo;
