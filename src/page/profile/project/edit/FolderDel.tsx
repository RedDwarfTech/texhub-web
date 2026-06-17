import { delFolder, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from 'react-toastify';
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import React from "react";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { DelFolderReq } from "@/model/request/proj/edit/DelFolderReq";
import { useTranslation } from "react-i18next";

export type DelFolderProps = {
    currFolder: TexProjectFolder | undefined;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
};

const FolderDel: React.FC<DelFolderProps> = (props: DelFolderProps) => {

    const editProjCancelRef = useRef<HTMLButtonElement>(null);
    const { t } = useTranslation();

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
                toast.error(t("err_del_folder_failed", { msg: resp.msg }));
            }
        });
    }

    return (
        <div>
            <div className="modal" id="delFolder" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{t("btn_del_folder")}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>{t("tips_del_folder_desc")}</div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">{t("btn_cancel")}</button>
                            <button type="button" 
                            className="btn btn-primary" 
                            onClick={() => { handleFolderDel(props.currFolder?.id!) }}>{t("btn_confirm")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FolderDel;