import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import {
  getFolderProject,
  getProjectList,
  trashProj,
} from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from "react-toastify";
import { TrashProjReq } from "@/model/request/proj/edit/TrashProjReq";
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import { useTranslation } from "react-i18next";

export type TrashProps = {
  projectId: string;
  currProject: any;
  getProjFilter: (query: QueryProjReq) => QueryProjReq;
  currFolder: TexProjectFolder | undefined;
  projType: number;
};

const TeXTrash: React.FC<TrashProps> = (props: TrashProps) => {
  const trashProjCancelRef = useRef<HTMLButtonElement>(null);
  const currProject = props.currProject;
  const { t } = useTranslation();

  const handleProjTrash = () => {
    if (!currProject || !currProject.project_id) {
      toast.info(t("tips_choose_proj"));
      return;
    }
    let proj: TrashProjReq = {
      project_id: currProject?.project_id,
      trash: 1,
    };
    trashProj(proj).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        if (props.currFolder && props.currFolder.default_folder !== 1) {
          getFolderProject(props.currFolder.id, props.projType);
        } else {
          getProjectList(props.getProjFilter({}));
        }
        if (trashProjCancelRef && trashProjCancelRef.current) {
          trashProjCancelRef.current.click();
        }
      } else {
        toast.error("项目移动到回收站失败，{}", resp.msg);
      }
    });
  };

  return (
    <div>
      <div className="modal" id="trashProj" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("title_move_trash")}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div>{t("tips_trash_proj")}</div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                ref={trashProjCancelRef}
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {t("btn_cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleProjTrash();
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

export default TeXTrash;
