import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { getProjectList, trashProj } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from "react-toastify";
import { TrashProjReq } from "@/model/request/proj/edit/TrashProjReq";

export type TrashProps = {
    projectId: string;
    currProject: any;
    getProjFilter: () => QueryProjReq;
};

const TeXTrash: React.FC<TrashProps> = (props: TrashProps) => {

    const trashProjCancelRef = useRef<HTMLButtonElement>(null);
    const currProject = props.currProject;

    const handleProjTrash = () => {
        if (!currProject || !currProject.project_id) {
            toast.info("请选择编辑项目");
            return;
        }
        let proj: TrashProjReq = {
            project_id: currProject?.project_id,
            trash: 1
        };
        trashProj(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList(props.getProjFilter());
                if (trashProjCancelRef && trashProjCancelRef.current) {
                    trashProjCancelRef.current.click();
                }
            } else {
                toast.error("项目移动到回收站失败，{}", resp.msg);
            }
        });
    }

    return (
        <div>
            <div className="modal" id="trashProj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">移动到回收站</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>确定将项目移动到回收站？</div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={trashProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjTrash() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXTrash;