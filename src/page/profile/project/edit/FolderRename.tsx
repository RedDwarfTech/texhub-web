import { getProjectList, renameFolder } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef } from "react";
import { toast } from 'react-toastify';
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import React from "react";
import { RenameFolderReq } from "@/model/request/proj/edit/RenameFolderReq";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { useTranslation } from "react-i18next";

export type RenameFolderProps = {
    currFolder: TexProjectFolder | undefined;
    handleFolderNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
};

const FolderRename: React.FC<RenameFolderProps> = (props: RenameFolderProps) => {

    const editProjCancelRef = useRef<HTMLButtonElement>(null);
    const { t } = useTranslation();

    const handleFolderRename = (folderId: number, folder_name: string) => {
        let renameReq: RenameFolderReq = {
            folder_id: folderId,
            folder_name: folder_name,
        };
        renameFolder(renameReq).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList(props.getProjFilter({}));
                if (editProjCancelRef && editProjCancelRef.current) {
                    editProjCancelRef.current.click();
                }
            } else {
                toast.error(t("err_rename_folder_failed", { msg: resp.msg }));
            }
        });
    }

    return (
        <div>
            <div className="modal" id="renameFolder" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{t("btn_rename_folder")}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                        <input id="editProjName"
                                onChange={props.handleFolderNameChange}
                                className="form-control"
                                value={props.currFolder?.folder_name.toString() || ""}
                                placeholder={t("tips_folder_name")}></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">{t("btn_cancel")}</button>
                            <button type="button" 
                            className="btn btn-primary" 
                            onClick={() => { handleFolderRename(props.currFolder?.id!, props.currFolder?.folder_name!) }}>{t("btn_confirm")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FolderRename;