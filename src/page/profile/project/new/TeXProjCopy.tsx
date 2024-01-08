import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { copyProj, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from "react-toastify";
import { UserService } from "rd-component";
import { CopyProjReq } from "@/model/request/proj/edit/CopyProjReq";
import { TexProjectModel } from "@/model/proj/TexProjectModel";

export type CopyProjProps = {
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    projType: number;
    currProject: TexProjectModel,
};

const TeXProjCopy: React.FC<CopyProjProps> = (props: CopyProjProps) => {

    const createFolderCancelRef = useRef<HTMLButtonElement>(null);

    const handleProjCopy = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning("登录后即可复制项目");
            return;
        }
        let doc:CopyProjReq = {
            project_id: props.currProject.project_id,
            version: ""
        }
        copyProj(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getProjectList(props.getProjFilter({}));
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
                            <h5 className="modal-title">复制项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>是否要复制本项目</div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={createFolderCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjCopy() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXProjCopy;