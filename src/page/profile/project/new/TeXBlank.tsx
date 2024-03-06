import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { createProject, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { UserService } from "rd-component";
import { useTranslation } from "react-i18next";

export type BlankProjProps = {
    projName: string;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TeXBlank: React.FC<BlankProjProps> = (props: BlankProjProps) => {

    const createDocCancelRef = useRef<HTMLButtonElement>(null);
    const projName = props.projName;
    const { t } = useTranslation();

    const handleProjCreate = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning("登录后即可创建项目");
            return;
        }
        if (projName == null || projName.length == 0) {
            toast.warning("请填写项目名称");
            return;
        }
        if (projName.length > 256) {
            toast.warning("超过项目名称长度限制");
            return;
        }
        let doc = {
            name: projName == null ? "" : projName
        };
        createProject(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getProjectList(props.getProjFilter({}));
                if (createDocCancelRef && createDocCancelRef.current) {
                    createDocCancelRef.current.click();
                }
            }else{
                switch(res.resultCode){
                    case "NON_VIP_TOO_MUCH_PROJ":
                        let msg = t("msg_non_vip_exceed");
                        debugger
                        toast.error(msg);
                        break;
                    case "VIP_TOO_MUCH_PROJ":
                        toast.error(t("msg_vip_exceed"));
                        break;
                }
            }
        });
    };

    return (
        <div>
            <div className="modal" id="newProj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">新建项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="projName" onChange={props.handleInputChange} className="form-control" placeholder="项目名称"></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={createDocCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjCreate() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXBlank;