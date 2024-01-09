import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { EditProjReq } from "@/model/request/proj/edit/EditProjReq";
import { editProject, getFolderProject, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef } from "react";
import { toast } from 'react-toastify';
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";

export type EditProps = {
    projectId: string;
    projName: string | undefined;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    handleEditInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    currProject: TexProjectModel,
    currFolder: TexProjectFolder | undefined
};

const TeXEdit: React.FC<EditProps> = (props: EditProps) => {

    const editProjCancelRef = useRef<HTMLButtonElement>(null);
    const currProject = props.currProject;

    const handleProjEdit = () => {
        if (!currProject || !currProject.project_id) {
            toast.info("请选择编辑项目");
            return;
        }
        if (props.projName == null || props.projName.length == 0) {
            toast.warning("请填写新项目名称");
            return;
        }
        if (props.projName.length > 256) {
            toast.warning("超过项目名称长度限制");
            return;
        }
        let proj: EditProjReq = {
            project_id: currProject?.project_id,
            proj_name: props.projName
        };
        editProject(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                if(props.currFolder && props.currFolder.default_folder !== 1){
                    getFolderProject(props.currFolder.id);
                }else{
                    getProjectList(props.getProjFilter({}));
                }
                if (editProjCancelRef && editProjCancelRef.current) {
                    editProjCancelRef.current.click();
                }
            } else {
                toast.error("重命名项目失败，{}", resp.msg);
            }
        });
    }

    return (
        <div>
            <div className="modal" id="editPrj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">编辑项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="editProjName"
                                onChange={props.handleEditInputChange}
                                className="form-control"
                                value={currProject?.proj_name.toString() || ""}
                                placeholder="项目名称"></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjEdit() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXEdit;