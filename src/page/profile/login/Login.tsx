import React, { useRef, useState } from "react";
import styles from "./Login.module.css";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { readConfig } from "@/config/app/config-reader";
import { UserService } from "rd-component";
import store from "@/store/store";
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { ResponseHandler } from "rdjs-wheel";

const Login: React.FC = () => {

  const fpPromise = FingerprintJS.load();
  const [activeTab, setActiveTab] = useState<String>("");
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    setDefaultTab();
  }, []);

  const setDefaultTab = () => {
    if (!activeTab || activeTab.length === 0) {
      const element = document.getElementById("phoneTabs") as HTMLButtonElement;
      if (element) {
        element.click();
      }
    }
  }

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
      UserService.userLoginByPhoneImpl(params, store, readConfig("loginUrl")).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          navigate("/");
        } else {
          toast.error(res.msg);
        }
      });
    })();
  }

  const userAlipayQrCodeLogin = () => {
    let param = {
      appId: readConfig("appId")
    };
    UserService.userLoginImpl(param, store, "/post/alipay/login/getQRCodeUrl").then((data: any) => {
      window.location.href = data.result;
    });
  }

  const userWechatQrCodeLogin = () => {
    let param = {
      appId: readConfig("appId")
    };
    UserService.userLoginImpl(param, store, "/post/wechat/login/getQRCodeUrl").then((data: any) => {
      window.location.href = data.result;
    });
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.loginTabs}>
          <button id="phoneTabs" className={styles.tablinks} onClick={(e) => { openCity(e, "phone") }}>手机号登录</button>
          <button className={styles.tablinks} onClick={(e) => { userWechatQrCodeLogin() }}>微信扫码登录</button>
          <button className={styles.tablinks} onClick={(e) => { userAlipayQrCodeLogin() }}>支付宝扫码登录</button>
        </div>
        <div id="phone" className={styles.tabcontent}>
          <h5>登录</h5>
          <form method="post" className={styles.loginElement} onSubmit={(e) => handlePhoneLogin(e)}>
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
              <button className={styles.loginButton} type="submit">登录</button> 
            </div>
            <div>
              <a href="/user/reg">没有账号，去注册</a>
            </div>
          </form>
        </div>
        <div id="wechat" className={styles.tabcontent}>
        </div>
        <div id="alipay" className={styles.tabcontent}>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;