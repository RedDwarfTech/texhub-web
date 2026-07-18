import { ToastContainer, toast } from "react-toastify";
import styles from "./ResetPwd.module.css";
import { useRef, useState } from "react";
import { resetPwd } from "@/service/project/PwdService";
import { ResetPwdReq } from "@/model/request/pwd/ResetPwdReq";
import { ResponseHandler } from "rdjs-wheel";
import { useLocation, useNavigate } from "react-router-dom";
import { readConfig } from "@/config/app/config-reader";
import React from "react";
import { useTranslation } from "react-i18next";
import TeXHubLogo from "@/assets/icon/texhub-logo.png";

const ResetPwd: React.FC = () => {

    const passwordInputRef = useRef(null);
    const reinputPwdInputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [phone, setPhone] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const { t } = useTranslation();

    React.useEffect(() => {
        const phoneParams = location.state.phone;
        const codeParams = location.state.code;
        setPhone(phoneParams!);
        setCode(codeParams!);
      }, [location]);
      
    const handleResetPwd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            !passwordInputRef.current ||
            (passwordInputRef.current as HTMLInputElement).value.length === 0
        ) {
            toast(t("tips_input_pwd_exclaim"));
            return;
        }
        if (
            !reinputPwdInputRef.current ||
            (reinputPwdInputRef.current as HTMLInputElement).value.length === 0
        ) {
            toast(t("tips_input_pwd_again"));
            return;
        }
        let reinputValue = (reinputPwdInputRef.current as HTMLInputElement).value;
        let phoneValue = (passwordInputRef.current as HTMLInputElement).value;
        if (reinputValue !== phoneValue) {
            toast(t("tips_pwd_inconsistent"));
            return;
        };
        
        let resetReq: ResetPwdReq = {
            phone: phone!,
            code: code!,
            password: reinputValue,
            appId: readConfig("appId")
        };
        resetPwd(resetReq).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                toast(t("tips_pwd_reset_success"),{
                    onClose:()=>{
                        navigate("/user/login");
                    }
                });
            } else {
                toast(resp.msg);
            }
        });
    }

    const handleClick = () => {
        navigate("/");
    };

    return (
        <div>
            <div className={styles.loginHaader}>
                <img alt="logo" onClick={handleClick} src={TeXHubLogo} />
            </div>
            <div className={styles.verifyCodeContainer}>
                <div className={styles.pwdForm}>
                    <div className={styles.pwdTabs}>
                        <div className={styles.tablinks}>{t("title_set_new_pwd")}</div>
                    </div>
                    <div className={styles.tabcontent}>
                        <h5>{t("title_set_new_pwd")}</h5>
                        <form
                            method="post"
                            className={styles.loginElement}
                            onSubmit={(e) => { handleResetPwd(e) }}
                        >
                            <div className={styles.password}>
                                <input
                                    type="password"
                                    ref={passwordInputRef}
                                    placeholder={t("tips_new_pwd_placeholder")}
                                    name="p"
                                />
                            </div>

                            <div className={styles.password}>
                                <input
                                    type="password"
                                    ref={reinputPwdInputRef}
                                    placeholder={t("tips_input_new_pwd_again_placeholder")}
                                    name="p"
                                />
                            </div>
                            <div className={styles.operate}>
                                <button className={styles.loginButton} type="submit">
                                    {t("btn_next_step")}
                                </button>
                            </div>
                            <div className={styles.handleSituation}>
                                <a href="/user/login">{t("tips_has_account_login")}</a>
                            </div>
                        </form>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}

export default ResetPwd;
