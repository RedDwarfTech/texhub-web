import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import {
  archiveProj,
  getProjectList,
  trashProj,
} from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from "react-toastify";
import { TrashProjReq } from "@/model/request/proj/edit/TrashProjReq";
import { ProjTabType } from "@/model/proj/config/ProjTabType";
import { ArchiveProjReq } from "@/model/request/proj/edit/ArchiveProjReq";
import { useTranslation } from "react-i18next";

export type RecoveryProps = {
  projectId: string;
  currProject: any;
  getProjFilter: (query: QueryProjReq) => QueryProjReq;
  activeTab: ProjTabType;
};

const TeXRecovery: React.FC<RecoveryProps> = (props: RecoveryProps) => {
  const recoveryProjCancelRef = useRef<HTMLButtonElement>(null);
  const currProject = props.currProject;
  const { t } = useTranslation();

  const handleProjTrash = () => {
    if (!currProject || !currProject.project_id) {
      toast.info("请选择编辑项目");
      return;
    }
    let proj: TrashProjReq = {
      project_id: currProject?.project_id,
      trash: 0,
    };
    trashProj(proj).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        getProjectList(props.getProjFilter({}));
        if (recoveryProjCancelRef && recoveryProjCancelRef.current) {
          recoveryProjCancelRef.current.click();
        }
      } else {
        toast.error("项目移动到回收站失败，{}", resp.msg);
      }
    });
  };

  const handleProjArchive = () => {
    if (!currProject || !currProject.project_id) {
      toast.info("请选择编辑项目");
      return;
    }
    let proj: ArchiveProjReq = {
      project_id: currProject?.project_id,
      archive_status: 0,
    };
    archiveProj(proj).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        getProjectList(props.getProjFilter({}));
        if (recoveryProjCancelRef && recoveryProjCancelRef.current) {
          recoveryProjCancelRef.current.click();
        }
      } else {
        toast.error("项目移动到回收站失败，{}", resp.msg);
      }
    });
  };

  const handleProjRecovery = () => {
    if (props.activeTab === ProjTabType.Archived) {
      handleProjArchive();
    }
    if (props.activeTab === ProjTabType.Trash) {
      handleProjTrash();
    }
  };

  return (
    <div>
      <div className="modal" id="recoveryProj" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("title_restore_proj")}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div>{t("tips_restore_proj")}</div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                ref={recoveryProjCancelRef}
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {t("btn_cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleProjRecovery();
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

export default TeXRecovery;
