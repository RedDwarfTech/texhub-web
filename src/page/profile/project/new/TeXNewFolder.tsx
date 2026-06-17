import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { createFolder, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UserService } from "rd-component";
import { CreateFolder } from "@/model/request/proj/create/CreateFolder";
import { useTranslation } from "react-i18next";

export type BlankProjProps = {
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    projType: number;
};

const TeXNewFolder: React.FC<BlankProjProps> = (props: BlankProjProps) => {

    const createFolderCancelRef = useRef<HTMLButtonElement>(null);
    const [folderName, setFolderName] = useState<string>('');
    const { t } = useTranslation();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFolderName(event.target.value);
    };

    const handleFolderCreate = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning(t("tips_need_login_create_folder"));
            return;
        }
        if (folderName == null || folderName.length === 0) {
            toast.warning(t("tips_fill_folder_name"));
            return;
        }
        if (folderName.length > 32) {
            toast.warning(t("tips_folder_name_length_exceed"));
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
                            <h5 className="modal-title">{t("new_folder")}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="projName" onChange={handleInputChange} className="form-control" placeholder={t("tips_folder_name")}></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={createFolderCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">{t("btn_cancel")}</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleFolderCreate() }}>{t("btn_confirm")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXNewFolder;