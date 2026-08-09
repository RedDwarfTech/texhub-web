import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import styles from "./RdTeXHubReg.module.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseMethods, ResponseHandler } from "rdjs-wheel";
import { AnyAction, Store } from "redux";
import { UserService } from "rd-component";
import { useTranslation } from "react-i18next";
import {
  sendRegVerifyEmail,
  sendRegVerifySMS,
} from "@/service/project/PwdService";
import { SendVerifyReq } from "@/model/request/pwd/SendVerifyReq";
import { EmailSendVerifyReq } from "@/model/request/pwd/EmailSendVerifyReq";
import { readConfig } from "@/config/app/config-reader";
import CountdownTimer from "@/page/pwd/verify/CountdownTimer";
import { SmsRemainInfo } from "@/model/user/SmsRemainInfo";
import TeXHubLogo from "@/assets/icon/texhub-logo.png";

const SMS_REG_REMAIN_KEY = "sms-reg-remain-seconds";
const EMAIL_REG_REMAIN_KEY = "email-reg-remain-seconds";

interface IRegProp {
  appId: string;
  store: Store<any, AnyAction>;
  regUrl: string;
}

const RdTeXHubReg: React.FC<IRegProp> = (props: IRegProp) => {
  const fpPromise = FingerprintJS.load();
  const phoneInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const passwordReinputRef = useRef(null);
  const emailInputRef = useRef(null);
  const emailCodeInputRef = useRef(null);
  const emailPasswordInputRef = useRef(null);
  const emailPasswordReinputRef = useRef(null);
  const emailPhoneInputRef = useRef(null);
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [pwdConfirmShown, setPwdConfirmShown] = useState(false);
  const [emailPwdShown, setEmailPwdShown] = useState(false);
  const [emailPwdConfirmShown, setEmailPwdConfirmShown] = useState(false);
  const [showCountDown, setShowCountDown] = useState<boolean>(false);
  const [emailShowCountDown, setEmailShowCountDown] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    const element = document.getElementById("phoneTab") as HTMLButtonElement;
    if (element) {
      element.click();
    }
  }, []);

  const togglePasswordVisibility = (
    e: React.MouseEvent<HTMLButtonElement>,
    isConfirm: boolean,
    isEmail: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEmail) {
      if (isConfirm) {
        setEmailPwdConfirmShown(!emailPwdConfirmShown);
      } else {
        setEmailPwdShown(!emailPwdShown);
      }
      return;
    }
    if (isConfirm) {
      setPwdConfirmShown(!pwdConfirmShown);
    } else {
      setPasswordShown(!passwordShown);
    }
  };

  const resetCodeSend = () => {
    setShowCountDown(false);
  };

  const resetEmailCodeSend = () => {
    setEmailShowCountDown(false);
  };

  const openCity = (
    evt: React.MouseEvent<HTMLButtonElement>,
    cityName: string
  ): void => {
    let i: number;
    const tabcontent = document.querySelectorAll(`.${styles.tabcontent}`);
    for (i = 0; i < tabcontent.length; i++) {
      (tabcontent[i] as HTMLElement).style.display = "none";
    }
    const tablinks = document.querySelectorAll(`.${styles.tablinks}`);
    for (i = 0; i < tablinks.length; i++) {
      (tablinks[i] as HTMLElement).className = (
        tablinks[i] as HTMLElement
      ).className.replace(" active", "");
    }
    const cityElement = document.getElementById(cityName);
    if (cityElement) {
      cityElement.style.display = "block";
    }
    (evt.currentTarget as HTMLElement).className += " active";
  };

  const sendVerifyCode = () => {
    if (
      !phoneInputRef.current ||
      (phoneInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_phone_exclaim"));
      return;
    }
    const phoneValue = (phoneInputRef.current as HTMLInputElement).value;
    const req: SendVerifyReq = {
      phone: phoneValue,
      app_id: readConfig("appId"),
    };
    sendRegVerifySMS(req).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        setShowCountDown(true);
      } else {
        toast(resp.msg);
      }
    });
  };

  const sendEmailVerifyCode = () => {
    if (
      !emailInputRef.current ||
      (emailInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_email"));
      return;
    }
    const emailValue = (emailInputRef.current as HTMLInputElement).value;
    const req: EmailSendVerifyReq = {
      email: emailValue,
      app_id: readConfig("appId"),
    };
    sendRegVerifyEmail(req).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        setEmailShowCountDown(true);
      } else {
        toast(resp.msg);
      }
    });
  };

  const renderVerifyCodeAction = () => {
    const remain = localStorage.getItem(SMS_REG_REMAIN_KEY);
    if (showCountDown || !BaseMethods.isNull(remain)) {
      if (!BaseMethods.isNull(remain)) {
        const remainObj: SmsRemainInfo = JSON.parse(remain!);
        if (remainObj.createdTime < Date.now() - 60000) {
          localStorage.removeItem(SMS_REG_REMAIN_KEY);
          return (
            <button
              type="button"
              className={styles.verifyCodeBtn}
              onClick={() => {
                sendVerifyCode();
              }}
            >
              {t("btn_get_verify_code")}
            </button>
          );
        } else {
          return (
            <CountdownTimer
              seconds={remainObj.remainSeconds}
              resetCodeSend={() => resetCodeSend()}
              storageKey={SMS_REG_REMAIN_KEY}
            />
          );
        }
      } else {
        return (
          <CountdownTimer
            seconds={60}
            resetCodeSend={() => resetCodeSend()}
            storageKey={SMS_REG_REMAIN_KEY}
          />
        );
      }
    } else {
      return (
        <button
          type="button"
          className={styles.verifyCodeBtn}
          onClick={() => {
            sendVerifyCode();
          }}
        >
          {t("btn_get_verify_code")}
        </button>
      );
    }
  };

  const renderEmailVerifyCodeAction = () => {
    const remain = localStorage.getItem(EMAIL_REG_REMAIN_KEY);
    if (emailShowCountDown || !BaseMethods.isNull(remain)) {
      if (!BaseMethods.isNull(remain)) {
        const remainObj: SmsRemainInfo = JSON.parse(remain!);
        if (remainObj.createdTime < Date.now() - 60000) {
          localStorage.removeItem(EMAIL_REG_REMAIN_KEY);
          return (
            <button
              type="button"
              className={styles.verifyCodeBtn}
              onClick={() => {
                sendEmailVerifyCode();
              }}
            >
              {t("btn_get_verify_code")}
            </button>
          );
        } else {
          return (
            <CountdownTimer
              seconds={remainObj.remainSeconds}
              resetCodeSend={() => resetEmailCodeSend()}
              storageKey={EMAIL_REG_REMAIN_KEY}
            />
          );
        }
      } else {
        return (
          <CountdownTimer
            seconds={60}
            resetCodeSend={() => resetEmailCodeSend()}
            storageKey={EMAIL_REG_REMAIN_KEY}
          />
        );
      }
    } else {
      return (
        <button
          type="button"
          className={styles.verifyCodeBtn}
          onClick={() => {
            sendEmailVerifyCode();
          }}
        >
          {t("btn_get_verify_code")}
        </button>
      );
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
      !codeInputRef.current ||
      (codeInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_verify_code"));
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
      verifyCode: (codeInputRef.current as HTMLInputElement).value,
    };
    (async () => {
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

  const handleEmailReg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !emailInputRef.current ||
      (emailInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_email"));
      return;
    }
    if (
      !emailCodeInputRef.current ||
      (emailCodeInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_verify_code"));
      return;
    }
    if (
      !emailPasswordInputRef.current ||
      (emailPasswordInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_pwd_exclaim"));
      return;
    }
    let pwd = (emailPasswordInputRef.current as HTMLInputElement).value;
    let reg =
      /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[`~!@#$%^&*()-=_+;':",./<>?])(?=\S+$).{6,32}$/;
    let pass = reg.test(pwd);
    if (!pass) {
      toast(t("tips_pwd_rule"));
      return;
    }
    if (
      !emailPasswordReinputRef.current ||
      (emailPasswordReinputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_pwd_exclaim"));
      return;
    }
    let reinputPwd = (emailPasswordReinputRef.current as HTMLInputElement).value;
    if (pwd !== reinputPwd) {
      toast(t("tips_pwd_inconsistent_reg"));
      return;
    }
    let emailValue = (emailInputRef.current as HTMLInputElement).value;
    let verifyCodeValue = (emailCodeInputRef.current as HTMLInputElement).value;
    let phoneValue = emailPhoneInputRef.current
      ? (emailPhoneInputRef.current as HTMLInputElement).value
      : "";
    (async () => {
      const fp = await fpPromise;
      const result = await fp.get();
      let params: any = {
        email: emailValue,
        password: pwd,
        verifyCode: verifyCodeValue,
        deviceId: result.visitorId,
        appId: props.appId,
      };
      if (phoneValue && phoneValue.length > 0) {
        params.phone = phoneValue;
      }
      UserService.userReg(params, props.store, "/infra/user/reg/email").then(
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

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div>
      <div className={styles.loginHaader}>
        <img alt="logo" onClick={handleClick} src={TeXHubLogo} />
      </div>
      <div className={styles.regContainer}>
        <div className={styles.regForm}>
          <div className={styles.regTabs}>
            <button
              id="phoneTab"
              className={styles.tablinks}
              onClick={(e) => {
                openCity(e, "regPhone");
              }}
            >
              {t("tab_reg_phone")}
            </button>
            <button
              id="emailTab"
              className={styles.tablinks}
              onClick={(e) => {
                openCity(e, "regEmail");
              }}
            >
              {t("tab_reg_email")}
            </button>
          </div>
          <div id="regPhone" className={styles.tabcontent}>
            <h5>{t("signup")}</h5>
            <form
              method="post"
              className={styles.loginElement}
              onSubmit={(e) => handlePhoneReg(e)}
            >
              <div className={styles.phoneInputGroup}>
                <select
                  id="countryCode"
                  className={styles.countryCodeSelect}
                  aria-label="国家区号"
                >
                  <option value="+86">+86</option>
                  <option value="+1">+1</option>
                </select>
                <input
                  type="text"
                  ref={phoneInputRef}
                  id="phone"
                  className={styles.phoneInput}
                  placeholder={t("tips_type_phone")}
                />
              </div>
              <div className={styles.verifyCodeRow}>
                <input
                  type="text"
                  ref={codeInputRef}
                  placeholder={t("label_verify_code")}
                />
                {renderVerifyCodeAction()}
              </div>
              <div className={styles.password}>
                <input
                  type="password"
                  ref={passwordInputRef}
                  placeholder={t("tips_password")}
                  name="p"
                />
                <button
                  onClick={(e) => togglePasswordVisibility(e, false, false)}
                >
                  {passwordShown ? "👁️" : "🔒"}
                </button>
              </div>
              <div className={styles.password}>
                <input
                  type="password"
                  ref={passwordReinputRef}
                  placeholder={t("tips_input_repeat_new_pwd_placeholder")}
                  name="p"
                />
                <button
                  onClick={(e) => togglePasswordVisibility(e, true, false)}
                >
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
          <div id="regEmail" className={styles.tabcontent}>
            <h5>{t("signup")}</h5>
            <form
              method="post"
              className={styles.loginElement}
              onSubmit={(e) => handleEmailReg(e)}
            >
              <div className={styles.verifyCodeRow} style={{ marginTop: 20 }}>
                <input
                  type="text"
                  ref={emailInputRef}
                  className={styles.phoneInput}
                  placeholder={t("tips_input_email")}
                />
              </div>
              <div className={styles.verifyCodeRow}>
                <input
                  type="text"
                  ref={emailCodeInputRef}
                  placeholder={t("label_verify_code")}
                />
                {renderEmailVerifyCodeAction()}
              </div>
              <div className={styles.password}>
                <input
                  type="password"
                  ref={emailPasswordInputRef}
                  placeholder={t("tips_password")}
                  name="p"
                />
                <button
                  onClick={(e) => togglePasswordVisibility(e, false, true)}
                >
                  {emailPwdShown ? "👁️" : "🔒"}
                </button>
              </div>
              <div className={styles.password}>
                <input
                  type="password"
                  ref={emailPasswordReinputRef}
                  placeholder={t("tips_input_repeat_new_pwd_placeholder")}
                  name="p"
                />
                <button
                  onClick={(e) => togglePasswordVisibility(e, true, true)}
                >
                  {emailPwdConfirmShown ? "👁️" : "🔒"}
                </button>
              </div>
              <div className={styles.verifyCodeRow}>
                <input
                  type="text"
                  ref={emailPhoneInputRef}
                  className={styles.phoneInput}
                  placeholder={t("tips_phone_optional")}
                />
              </div>
              <div className={styles.operate}>
                <button className={styles.loginButton} type="submit">
                  {t("signup")}
                </button>
                <a href="/user/login">{t("tips_has_account_login")}</a>
              </div>
            </form>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default RdTeXHubReg;
