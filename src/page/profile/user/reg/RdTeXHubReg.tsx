import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import styles from "./RdTeXHubReg.module.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponseHandler } from "rdjs-wheel";
import { AnyAction, Store } from "redux";
import { UserService } from "rd-component";
import { useTranslation } from "react-i18next";

interface IRegProp {
  appId: string;
  store: Store<any, AnyAction>;
  regUrl: string;
}

const RdTeXHubReg: React.FC<IRegProp> = (props: IRegProp) => {
  const fpPromise = FingerprintJS.load();
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const passwordReinputRef = useRef(null);
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [pwdConfirmShown, setPwdConfirmShown] = useState(false);
  const { t } = useTranslation();

  const togglePasswordVisibility = (
    e: React.MouseEvent<HTMLButtonElement>,
    isConfirm: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (isConfirm) {
      setPwdConfirmShown(!pwdConfirmShown);
    } else {
      setPasswordShown(!passwordShown);
    }
  };

  const handlePhoneReg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !phoneInputRef.current ||
      (phoneInputRef.current as HTMLInputElement).value.length === 0
    ) {
      debugger;
      toast("请输入用户名!");
      return;
    }
    if (
      !passwordInputRef.current ||
      (passwordInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast("请输入密码!");
      return;
    }
    let pwd = (passwordInputRef.current as HTMLInputElement).value;
    let reg =
      /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[`~!@#$%^&*()-=_+;':",./<>?])(?=\S+$).{6,32}$/;
    let pass = reg.test(pwd);
    if (!pass) {
      toast("密码必须包含字母、数字和特殊符号且长度是6-32位!");
      return;
    }
    if (
      !passwordReinputRef.current ||
      (passwordReinputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast("请输入密码!");
      return;
    }
    let reinputPwd = (passwordReinputRef.current as HTMLInputElement).value;
    if (pwd !== reinputPwd) {
      toast("输入密码不一致!");
      return;
    }
    let values = {
      phone: (phoneInputRef.current as HTMLInputElement).value,
      password: pwd,
    };
    (async () => {
      // Get the visitor identifier when you need it.
      const fp = await fpPromise;
      const result = await fp.get();
      let params = {
        ...values,
        deviceId: result.visitorId,
        deviceName: result.visitorId,
        deviceType: 4,
        appId: props.appId,
        loginType: 1,
      };
      UserService.userReg(params, props.store, props.regUrl).then(
        (res: any) => {
          if (ResponseHandler.responseSuccess(res)) {
            toast.success(t("tips_reg_success"));
            navigate("/user/login");
          } else {
            toast.error(res.msg);
          }
        }
      );
    })();
  };

  return (
    <div className={styles.regContainer}>
      <div className={styles.regForm}>
        <form
          method="post"
          className={styles.loginElement}
          onSubmit={(e) => handlePhoneReg(e)}
        >
          <h5>注册</h5>
          <div className={styles.userName}>
            <select id="countryCode" className={styles.countryCodeSelect}>
              <option value="+86">+86</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="text"
              ref={phoneInputRef}
              id="phone"
              placeholder="请输入手机号码"
            />
          </div>
          <div className={styles.password}>
            <input
              type="password"
              ref={passwordInputRef}
              placeholder="密码"
              name="p"
            ></input>
            <button onClick={(e) => togglePasswordVisibility(e, false)}>
              {passwordShown ? "👁️" : "🔒"}
            </button>
          </div>
          <div className={styles.password}>
            <input
              type="password"
              ref={passwordReinputRef}
              placeholder="再次输入密码"
              name="p"
            ></input>
            <button onClick={(e) => togglePasswordVisibility(e, true)}>
              {pwdConfirmShown ? "👁️" : "🔒"}
            </button>
          </div>
          <div className={styles.operate}>
            <button className={styles.loginButton} type="submit">
              注册
            </button>
            <a href="/user/login">已经有账号，去登录</a>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RdTeXHubReg;
