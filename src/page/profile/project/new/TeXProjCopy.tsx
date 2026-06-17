import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { copyProj, getFolderProject, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from "react-toastify";
import { UserService } from "rd-component";
import { CopyProjReq } from "@/model/request/proj/edit/CopyProjReq";
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import { useTranslation } from "react-i18next";

export type CopyProjProps = {
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    projType: number;
    currProject: TexProjectModel,
    currFolder: TexProjectFolder | undefined
};

const TeXProjCopy: React.FC<CopyProjProps> = (props: CopyProjProps) => {

    const createFolderCancelRef = useRef<HTMLButtonElement>(null);
    const { t } = useTranslation();

    const handleProjCopy = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning(t("tips_need_login_copy_proj"));
            return;
        }
        if(!props.currFolder || !props.currFolder.id){
            return;
        }
        let doc:CopyProjReq = {
            project_id: props.currProject.project_id,
            version: "",
            folder_id: props.currFolder.id
        };
        copyProj(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                if(props.currFolder && props.currFolder.default_folder !== 1){
                    getFolderProject(props.currFolder.id, props.projType);
                }else{
                    getProjectList(props.getProjFilter({}));
                }
                if (createFolderCancelRef && createFolderCancelRef.current) {
                    createFolderCancelRef.current.click();
                }
            }
        });
    };

    return (
        <div>
            <div className="modal" id="copyProject" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{t("btn_copy_proj")}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>{t("tips_copy_proj_confirm")}</div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={createFolderCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">{t("btn_cancel")}</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjCopy() }}>{t("btn_confirm")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXProjCopy;