import { delFolder, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from 'react-toastify';
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import React from "react";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { DelFolderReq } from "@/model/request/proj/edit/DelFolderReq";

export type DelFolderProps = {
    currFolder: TexProjectFolder | undefined;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
};

const FolderDel: React.FC<DelFolderProps> = (props: DelFolderProps) => {

    const editProjCancelRef = useRef<HTMLButtonElement>(null);

    const handleFolderDel = (folderId: number) => {
        let renameReq: DelFolderReq = {
            folder_id: folderId
        };
        delFolder(renameReq).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList(props.getProjFilter({}));
                if (editProjCancelRef && editProjCancelRef.current) {
                    editProjCancelRef.current.click();
                }
            } else {
                toast.error("删除文件夹失败，{}", resp.msg);
            }
        });
    }

    return (
        <div>
            <div className="modal" id="delFolder" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">删除文件夹</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>删除文件夹后，文件夹下的文件会移动到列表</div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" 
                            className="btn btn-primary" 
                            onClick={() => { handleFolderDel(props.currFolder?.id!) }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FolderDel;