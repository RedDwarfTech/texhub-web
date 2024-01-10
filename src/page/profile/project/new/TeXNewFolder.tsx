import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { createFolder, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UserService } from "rd-component";
import { CreateFolder } from "@/model/request/proj/create/CreateFolder";

export type BlankProjProps = {
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    projType: number;
};

const TeXNewFolder: React.FC<BlankProjProps> = (props: BlankProjProps) => {

    const createFolderCancelRef = useRef<HTMLButtonElement>(null);
    const [folderName, setFolderName] = useState<string>('');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFolderName(event.target.value);
    };

    const handleFolderCreate = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning("登录后即可创建文件夹");
            return;
        }
        if (folderName == null || folderName.length == 0) {
            toast.warning("请填写文件夹名称");
            return;
        }
        if (folderName.length > 256) {
            toast.warning("超过文件夹名称长度限制");
            return;
        }
        let doc:CreateFolder = {
            folder_name: folderName == null ? "" : folderName,
            proj_type: props.projType
        }
        createFolder(doc).then((res) => {
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
            <div className="modal" id="newFolder" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">新建文件夹</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="projName" onChange={handleInputChange} className="form-control" placeholder="文件夹名称"></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={createFolderCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleFolderCreate() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXNewFolder;