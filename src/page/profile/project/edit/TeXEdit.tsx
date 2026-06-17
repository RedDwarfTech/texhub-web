import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { EditProjReq } from "@/model/request/proj/edit/EditProjReq";
import { editProject, getFolderProject, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef } from "react";
import { toast } from 'react-toastify';
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import { useTranslation } from "react-i18next";

export type EditProps = {
    projectId: string;
    projName: string | undefined;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    handleEditInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    currProject: TexProjectModel,
    currFolder: TexProjectFolder | undefined,
    projType: number;
};

const TeXEdit: React.FC<EditProps> = (props: EditProps) => {

    const editProjCancelRef = useRef<HTMLButtonElement>(null);
    const currProject = props.currProject;
    const { t } = useTranslation();

    const handleProjEdit = () => {
        if (!currProject || !currProject.project_id) {
            toast.info(t("tips_choose_edit_proj"));
            return;
        }
        if (props.projName == null || props.projName.length == 0) {
            toast.warning(t("tips_fill_new_proj_name"));
            return;
        }
        if (props.projName.length > 256) {
            toast.warning(t("tips_proj_name_length_exceed"));
            return;
        }
        let proj: EditProjReq = {
            project_id: currProject?.project_id,
            proj_name: props.projName
        };
        editProject(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                if(props.currFolder && props.currFolder.default_folder !== 1){
                    getFolderProject(props.currFolder.id, props.projType);
                }else{
                    getProjectList(props.getProjFilter({}));
                }
                if (editProjCancelRef && editProjCancelRef.current) {
                    editProjCancelRef.current.click();
                }
            } else {
                toast.error(t("err_rename_proj_failed", { msg: resp.msg }));
            }
        });
    }

    return (
        <div>
            <div className="modal" id="editPrj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{t("title_edit_proj")}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="editProjName"
                                onChange={props.handleEditInputChange}
                                className="form-control"
                                value={currProject?.proj_name.toString() || ""}
                                placeholder={t("tips_proj_name")}></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">{t("btn_cancel")}</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjEdit() }}>{t("btn_confirm")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXEdit;