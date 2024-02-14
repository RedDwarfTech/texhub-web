import { ToastContainer } from "react-toastify";
import styles from "./ResetPwd.module.css";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const ResetPwd: React.FC = () => {

    const phoneInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const navigate = useNavigate();

    const handleChangePwd = () => {
        
    }

    return (<div className={styles.verifyCodeContainer}>
        <div id="phone" className={styles.tabcontent}>
            <h5>设置新密码</h5>
            <form
                method="post"
                className={styles.loginElement}
                onSubmit={(e) => { }}
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
                        ref={passwordInputRef}
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