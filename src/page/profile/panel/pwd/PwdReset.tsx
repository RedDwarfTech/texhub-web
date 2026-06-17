import { readConfig } from "@/config/app/config-reader";
import store from "@/redux/store/store";
import { UserService } from "rd-component";
import { ResponseHandler } from "rdjs-wheel";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const PwdReset: React.FC = () => {

    const [oldPwd, setOldPwd] = useState<string>();
    const [newPwd, setNewPwd] = useState<string>();
    const [repeatNewPwd, setRepeatNewPwd] = useState<string>();
    const { t } = useTranslation();

    const handleOldPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        setOldPwd(inputValue);
    }

    const handleNewPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        setNewPwd(inputValue);
    }

    const handleRepeatNewPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        setRepeatNewPwd(inputValue);
    }

    const handlePwdReset = () => {
        if (!oldPwd) {
            toast.warn(t("tips_input_old_pwd"));
            return;
        }
        if (!newPwd) {
            toast.warn(t("tips_input_new_pwd"));
            return;
        }
        if (!repeatNewPwd) {
            toast.warn(t("tips_input_repeat_new_pwd"));
            return;
        }
        if(repeatNewPwd !== newPwd) {
            toast.warn(t("tips_pwd_not_match"));
            return;
        }
        if(oldPwd === newPwd){
            toast.warn(t("tips_old_new_pwd_same"));
            return;
        }
        let params = {
            oldPassword:oldPwd,
            newPassword:newPwd
        };
        UserService.doResetPwd(params, "/infra/user/change/pwd", store).then((resp)=>{
            if(ResponseHandler.responseSuccess(resp)) {
                toast.success(t("tips_pwd_change_success"));
                UserService.doLoginOut(readConfig("logoutUrl"));
            }else{
                toast.warn(resp.msg);
            }
        });
    }

    return (
        <div>
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                    <h6 className="card-title">{t("resetPwd")}</h6>
                </div>
                <div className="card-body col">
                    <div className="col mb-3">
                        <div className="mb-1"><span className="user-info">{t("label_old_pwd")}</span></div>
                        <div>
                            <input className="form-control"
                                onChange={handleOldPwdChange}
                                type="password"
                                placeholder={t("tips_input_old_pwd_placeholder")}></input>
                        </div>
                    </div>
                    <div className="col mb-3">
                        <div className="mb-1"><span className="user-info">{t("label_new_pwd_colon")}</span></div>
                        <div >
                            <input className="form-control"
                                onChange={handleNewPwdChange}
                                type="password"
                                placeholder={t("tips_input_new_pwd_placeholder")}></input>
                        </div>
                    </div>
                    <div className="col mb-4">
                        <div className="mb-1"><span className="user-info">{t("label_repeat_new_pwd")}</span></div>
                        <div >
                            <input className="form-control"
                                onChange={handleRepeatNewPwdChange}
                                type="password"
                                placeholder={t("tips_input_repeat_new_pwd_placeholder")}></input>
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={handlePwdReset}>{t("resetPwd")}</button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default PwdReset;
