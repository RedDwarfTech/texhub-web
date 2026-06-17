import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { ArchiveProjReq } from "@/model/request/proj/edit/ArchiveProjReq";
import { archiveProj, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export type ArchiveProps = {
    projectId: string;
    currProject: any;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
};

const TeXArchive: React.FC<ArchiveProps> = (props: ArchiveProps) => {

    const archiveProjCancelRef = useRef<HTMLButtonElement>(null);
    const currProject = props.currProject;
    const { t } = useTranslation();

    const handleProjArchive = () => {
        if (!currProject || !currProject.project_id) {
            toast.info(t("tips_choose_edit_proj"));
            return;
        }
        let proj: ArchiveProjReq = {
            project_id: currProject?.project_id,
            archive_status: 1
        };
        archiveProj(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList(props.getProjFilter({}));
                if (archiveProjCancelRef && archiveProjCancelRef.current) {
                    archiveProjCancelRef.current.click();
                }
            } else {
                toast.error(t("err_archive_proj_failed", { msg: resp.msg }));
            }
        });
    }

    return (
        <div>
            <div className="modal" id="archiveProj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{t("title_archive_proj")}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>{t("tips_archive_proj_confirm")}</div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={archiveProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">{t("btn_cancel")}</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjArchive() }}>{t("btn_confirm")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXArchive;