import { ToastContainer, toast } from "react-toastify";
import styles from "./ResetPwd.module.css";
import { useRef, useState } from "react";
import { resetPwd } from "@/service/project/PwdService";
import { ResetPwdReq } from "@/model/request/pwd/ResetPwdReq";
import { ResponseHandler } from "rdjs-wheel";
import { useLocation, useNavigate } from "react-router-dom";
import { readConfig } from "@/config/app/config-reader";
import React from "react";

const ResetPwd: React.FC = () => {

    const passwordInputRef = useRef(null);
    const reinputPwdInputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [phone, setPhone] = useState<string>('');
    const [code, setCode] = useState<string>('');

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
            toast("请输入密码!");
            return;
        }
        if (
            !reinputPwdInputRef.current ||
            (reinputPwdInputRef.current as HTMLInputElement).value.length === 0
        ) {
            toast("请再次输入密码!");
            return;
        }
        let reinputValue = (reinputPwdInputRef.current as HTMLInputElement).value;
        let phoneValue = (passwordInputRef.current as HTMLInputElement).value;
        if (reinputValue !== phoneValue) {
            toast("两次输入密码不一致!");
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
                toast("密码重置成功",{
                    onClose:()=>{
                        navigate("/user/login");
                    }
                });
            } else {
                toast(resp.msg);
            }
        });
    }

    return (
        <div className={styles.verifyCodeContainer}>
            <div id="phone" className={styles.tabcontent}>
                <h5>设置新密码</h5>
                <form
                    method="post"
                    className={styles.loginElement}
                    onSubmit={(e) => { handleResetPwd(e) }}
                >
                    <div className={styles.password}>
                        <input
                            type="password"
                            ref={passwordInputRef}
                            placeholder="新密码"
                            name="p"
                        ></input>
                    </div>

                    <div className={styles.password}>
                        <input
                            type="password"
                            ref={reinputPwdInputRef}
                            placeholder="再次输入新密码"
                            name="p"
                        ></input>
                    </div>
                    <div className={styles.operate}>
                        <button className={styles.loginButton} type="submit">
                            下一步
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default ResetPwd;