import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { createFolder, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { UserService } from "rd-component";

export type BlankProjProps = {
    projName: string;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TeXNewFolder: React.FC<BlankProjProps> = (props: BlankProjProps) => {

    const createDocCancelRef = useRef<HTMLButtonElement>(null);
    const projName = props.projName;

    const handleFolderCreate = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning("登录后即可创建文件夹");
            return;
        }
        if (projName == null || projName.length == 0) {
            toast.warning("请填写文件夹名称");
            return;
        }
        if (projName.length > 256) {
            toast.warning("超过文件夹名称长度限制");
            return;
        }
        let doc = {
            name: projName == null ? "" : projName
        };
        createFolder(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getProjectList(props.getProjFilter({}));
                if (createDocCancelRef && createDocCancelRef.current) {
                    createDocCancelRef.current.click();
                }
            }
        });
    };

    return (
        <div>
            <div className="modal" id="newFolder" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">新建文件夹</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="projName" onChange={props.handleInputChange} className="form-control" placeholder="文件夹名称"></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={createDocCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleFolderCreate() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXNewFolder;