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
      toast(t("tips_input_username"));
      return;
    }
    if (
      !passwordInputRef.current ||
      (passwordInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_pwd_exclaim"));
      return;
    }
    let pwd = (passwordInputRef.current as HTMLInputElement).value;
    let reg =
      /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[`~!@#$%^&*()-=_+;':",./<>?])(?=\S+$).{6,32}$/;
    let pass = reg.test(pwd);
    if (!pass) {
      toast(t("tips_pwd_rule"));
      return;
    }
    if (
      !passwordReinputRef.current ||
      (passwordReinputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_pwd_exclaim"));
      return;
    }
    let reinputPwd = (passwordReinputRef.current as HTMLInputElement).value;
    if (pwd !== reinputPwd) {
      toast(t("tips_pwd_inconsistent_reg"));
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
          <h5>{t("signup")}</h5>
          <div className={styles.userName}>
            <select id="countryCode" className={styles.countryCodeSelect}>
              <option value="+86">+86</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="text"
              ref={phoneInputRef}
              id="phone"
              placeholder={t("tips_type_phone")}
            />
          </div>
          <div className={styles.password}>
            <input
              type="password"
              ref={passwordInputRef}
              placeholder={t("tips_password")}
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
              placeholder={t("tips_input_repeat_new_pwd_placeholder")}
              name="p"
            ></input>
            <button onClick={(e) => togglePasswordVisibility(e, true)}>
              {pwdConfirmShown ? "👁️" : "🔒"}
            </button>
          </div>
          <div className={styles.operate}>
            <button className={styles.loginButton} type="submit">
              {t("signup")}
            </button>
            <a href="/user/login">{t("tips_has_account_login")}</a>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RdTeXHubReg;
