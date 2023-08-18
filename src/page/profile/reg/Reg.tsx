import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import styles from "./Reg.module.css";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useRef, useState } from 'react';
import { readConfig } from '@/config/app/config-reader';
import { UserService } from 'rd-component';
import store from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { ResponseHandler } from 'rdjs-wheel';

const Reg: React.FC = () => {

    const fpPromise = FingerprintJS.load();
    const [activeTab, setActiveTab] = useState<String>("");
    const phoneInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const navigate = useNavigate();

    const openCity = (evt: React.MouseEvent<HTMLButtonElement>, cityName: string): void => {
        setActiveTab(cityName);
        let i: number;
        const tabcontent = document.querySelectorAll(`.${styles.tabcontent}`);
        for (i = 0; i < tabcontent.length; i++) {
            (tabcontent[i] as HTMLElement).style.display = "none";
        }
        const tablinks = document.querySelectorAll(`.${styles.tablinks}`);
        for (i = 0; i < tablinks.length; i++) {
            (tablinks[i] as HTMLElement).className = (tablinks[i] as HTMLElement).className.replace(" active", "");
        }
        const cityElement = document.getElementById(cityName);
        if (cityElement) {
            cityElement.style.display = "block";
        }
        (evt.currentTarget as HTMLElement).className += " active";
    };

    const handlePhoneLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!phoneInputRef.current || (phoneInputRef.current as HTMLInputElement).value.length === 0) {
            debugger
            toast("请输入用户名!");
            return;
        }
        if (!passwordInputRef.current || (passwordInputRef.current as HTMLInputElement).value.length === 0) {
            toast("请输入密码!");
            return;
        }
        let values = {
            phone: (phoneInputRef.current as HTMLInputElement).value,
            password: (passwordInputRef.current as HTMLInputElement).value
        };
        ; (async () => {
            // Get the visitor identifier when you need it.
            const fp = await fpPromise
            const result = await fp.get()
            let params = {
                ...values,
                deviceId: result.visitorId,
                deviceName: result.visitorId,
                deviceType: 4,
                appId: readConfig("appId"),
                loginType: 1
            };
            UserService.userReg(params, store, readConfig("regUrl")).then((res) => {
                if(ResponseHandler.responseSuccess(res)){
                    toast.success("注册成功");
                    navigate("/user/login");
                }else{
                    toast.error(res.msg);
                }
            });
        })();
    }

    return (
        <div className={styles.regContainer}>
            <div className={styles.regForm}>
                <form method="post" className={styles.loginElement} onSubmit={(e) => handlePhoneLogin(e)}>
                    <h5>注册</h5>
                    <div className={styles.userName}>
                        <select id="countryCode" className={styles.countryCodeSelect}>
                            <option value="+86">+86</option>
                            <option value="+1">+1</option>
                        </select>
                        <input type="text" ref={phoneInputRef} id="phone" placeholder="请输入手机号码" />
                    </div>
                    <div className={styles.password}>
                        <input type="password" ref={passwordInputRef} placeholder="密码" name="p"></input>
                    </div>
                    <div className={styles.operate}>
                        <button className={styles.loginButton} type="submit">注册</button>
                        <a href="/user/login">已经有账号，去登录</a>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Reg;