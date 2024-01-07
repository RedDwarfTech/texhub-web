import { renameFolder } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef } from "react";
import { toast } from 'react-toastify';
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import React from "react";
import { RenameFolderReq } from "@/model/request/proj/edit/RenameFolderReq";

export type RenameFolderProps = {
    currFolder: TexProjectFolder | undefined;
    handleFolderNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const FolderRename: React.FC<RenameFolderProps> = (props: RenameFolderProps) => {

    const editProjCancelRef = useRef<HTMLButtonElement>(null);

    const handleFolderRename = (folderId: number, folder_name: string) => {
        let renameReq: RenameFolderReq = {
            folder_id: folderId,
            folder_name: folder_name,
        };
        renameFolder(renameReq).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                if (editProjCancelRef && editProjCancelRef.current) {
                    editProjCancelRef.current.click();
                }
            } else {
                toast.error("重命名文件夹失败，{}", resp.msg);
            }
        });
    }

    return (
        <div>
            <div className="modal" id="renameFolder" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">重命名文件夹</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                        <input id="editProjName"
                                onChange={props.handleFolderNameChange}
                                className="form-control"
                                value={props.currFolder?.folder_name.toString() || ""}
                                placeholder="文件夹名称"></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" 
                            className="btn btn-primary" 
                            onClick={() => { handleFolderRename(props.currFolder?.id!, props.currFolder?.folder_name!) }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FolderRename;