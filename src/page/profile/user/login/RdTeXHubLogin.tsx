import React, { useRef, useState } from "react";
import styles from "./RdTeXHubLogin.module.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BaseMethods, ResponseHandler } from "rdjs-wheel";
import { AnyAction, Store } from "redux";
import Turnstile, { useTurnstile } from "react-turnstile";
import { UserService } from "rd-component";
import TeXHubLogo from "@/assets/icon/texhub-logo.png";
import { useTranslation } from "react-i18next";
import { sendLoginVerifyEmail } from "@/service/project/PwdService";
import { EmailSendVerifyReq } from "@/model/request/pwd/EmailSendVerifyReq";
import { readConfig } from "@/config/app/config-reader";
import CountdownTimer from "@/page/pwd/verify/CountdownTimer";
import { SmsRemainInfo } from "@/model/user/SmsRemainInfo";

const EMAIL_LOGIN_REMAIN_KEY = "email-login-remain-seconds";

interface ILoginProp {
  appId: string;
  store: Store<any, AnyAction>;
  loginUrl: string;
  cfSiteKey: string;
  enableWechatLogin: boolean;
}

const RdTeXHubLogin: React.FC<ILoginProp> = (props: ILoginProp) => {
  const fpPromise = FingerprintJS.load();
  const [activeTab, setActiveTab] = useState<String>("");
  const [cfVerifyToken, setCfVerifyToken] = useState<string>("");
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const emailPwdInputRef = useRef(null);
  const emailCodeInputRef = useRef(null);
  const navigate = useNavigate();
  const turnstile = useTurnstile();
  const { t } = useTranslation();

  const [passwordShown, setPasswordShown] = useState(false);
  const [emailPwdShown, setEmailPwdShown] = useState(false);
  const [emailLoginMode, setEmailLoginMode] = useState<"pwd" | "code">("pwd");
  const [emailShowCountDown, setEmailShowCountDown] = useState<boolean>(false);

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPasswordShown(!passwordShown);
  };

  const toggleEmailPwdVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEmailPwdShown(!emailPwdShown);
  };

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
  };

  const openCity = (
    evt: React.MouseEvent<HTMLButtonElement>,
    cityName: string
  ): void => {
    setActiveTab(cityName);
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

  const resetTurnstile = () => {
    setCfVerifyToken("");
    turnstile?.reset();
  };

  const resetEmailCodeSend = () => {
    setEmailShowCountDown(false);
  };

  const sendEmailLoginVerifyCode = () => {
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
    sendLoginVerifyEmail(req).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        setEmailShowCountDown(true);
      } else {
        toast(resp.msg);
      }
    });
  };

  const renderEmailCodeAction = () => {
    const remain = localStorage.getItem(EMAIL_LOGIN_REMAIN_KEY);
    if (emailShowCountDown || !BaseMethods.isNull(remain)) {
      if (!BaseMethods.isNull(remain)) {
        const remainObj: SmsRemainInfo = JSON.parse(remain!);
        if (remainObj.createdTime < Date.now() - 60000) {
          localStorage.removeItem(EMAIL_LOGIN_REMAIN_KEY);
          return (
            <button
              type="button"
              className={styles.verifyCodeBtn}
              onClick={() => {
                sendEmailLoginVerifyCode();
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
              storageKey={EMAIL_LOGIN_REMAIN_KEY}
            />
          );
        }
      } else {
        return (
          <CountdownTimer
            seconds={60}
            resetCodeSend={() => resetEmailCodeSend()}
            storageKey={EMAIL_LOGIN_REMAIN_KEY}
          />
        );
      }
    } else {
      return (
        <button
          type="button"
          className={styles.verifyCodeBtn}
          onClick={() => {
            sendEmailLoginVerifyCode();
          }}
        >
          {t("btn_get_verify_code")}
        </button>
      );
    }
  };

  const handlePhoneLogin = (e: React.FormEvent<HTMLFormElement>) => {
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
      toast(t("tips_input_pwd"));
      return;
    }
    if (!cfVerifyToken) {
      toast(t("tips_complete_captcha"));
      return;
    }
    let values = {
      phone: (phoneInputRef.current as HTMLInputElement).value,
      password: (passwordInputRef.current as HTMLInputElement).value,
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
        cfToken: cfVerifyToken,
      };
      UserService.userLoginByPhoneImpl(
        params,
        props.store,
        props.loginUrl
      ).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          navigate("/");
        } else {
          toast.error(res.msg);
          resetTurnstile();
        }
      });
    })();
  };

  const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailElement = emailInputRef.current as HTMLInputElement | null;
    if (!emailElement || emailElement.value.length === 0) {
      toast(t("tips_input_email"));
      return;
    }
    let passwordValue: string | undefined;
    let verifyCodeValue: string | undefined;
    if (emailLoginMode === "pwd") {
      const el = emailPwdInputRef.current as HTMLInputElement | null;
      if (!el || el.value.length === 0) {
        toast(t("tips_input_pwd"));
        return;
      }
      passwordValue = el.value;
    } else {
      const el = emailCodeInputRef.current as HTMLInputElement | null;
      if (!el || el.value.length === 0) {
        toast(t("tips_input_verify_code"));
        return;
      }
      verifyCodeValue = el.value;
    }
    if (!cfVerifyToken) {
      toast(t("tips_complete_captcha"));
      return;
    }
    let values: any = {
      email: emailElement.value,
    };
    if (passwordValue !== undefined) {
      values.password = passwordValue;
    } else {
      values.verifyCode = verifyCodeValue;
    }
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
        cfToken: cfVerifyToken,
      };
      UserService.userLoginByPhoneImpl(
        params,
        props.store,
        "/infra/user/login/email"
      ).then((res) => {
        if (ResponseHandler.responseSuccess(res)) {
          navigate("/");
        } else {
          toast.error(res.msg);
          resetTurnstile();
        }
      });
    })();
  };

  const userAlipayQrCodeLogin = () => {
    let param = {
      appId: props.appId,
    };
    UserService.userLoginImpl(
      param,
      props.store,
      "/infra/alipay/login/getQRCodeUrl"
    ).then((data: any) => {
      window.location.href = data.result;
    });
  };

  const userWechatQrCodeLogin = () => {
    let param = {
      appId: props.appId,
    };
    UserService.userLoginImpl(
      param,
      props.store,
      "/infra/wechat/login/getQRCodeUrl"
    ).then((data: any) => {
      window.location.href = data.result;
    });
  };

  const renderWechatLogins = () => {
    if (props.enableWechatLogin) {
      return (
        <button
          className={styles.tablinks}
          onClick={(e) => {
            userWechatQrCodeLogin();
          }}
        >
          微信扫码登录
        </button>
      );
    }
  };

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div>
      <div className={styles.loginHaader}>
        <img alt="logo" onClick={handleClick} src={TeXHubLogo}></img>
      </div>
      <div className={styles.loginContainer}>
        <div className={styles.loginForm}>
          <div className={styles.loginTabs}>
            <button
              id="phoneTabs"
              className={styles.tablinks}
              onClick={(e) => {
                openCity(e, "phone");
              }}
            >
              {t("btn_login")}
            </button>
            <button
              id="emailTabs"
              className={styles.tablinks}
              onClick={(e) => {
                openCity(e, "email");
              }}
            >
              {t("tab_login_email")}
            </button>
            {renderWechatLogins()}
          </div>
          <div id="phone" className={styles.tabcontent}>
            <h5>{t("title_login")}</h5>
            <form
              method="post"
              className={styles.loginElement}
              onSubmit={(e) => handlePhoneLogin(e)}
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
              <div className={styles.pwd}>
                <input
                  type={passwordShown ? "text" : "password"}
                  ref={passwordInputRef}
                  placeholder={t("tips_password")}
                  name="p"
                ></input>
                <button onClick={togglePasswordVisibility}>
                  {passwordShown ? "👁️" : "🔒"}
                </button>
              </div>
              <div>
                <Turnstile
                  className={styles.turnstile}
                  sitekey={props.cfSiteKey}
                  onVerify={(token) => {
                    setCfVerifyToken(token);
                  }}
                  onExpire={() => {
                    resetTurnstile();
                  }}
                  onError={() => {
                    resetTurnstile();
                  }}
                />
              </div>
              <div className={styles.operate}>
                <button className={styles.loginButton} type="submit">
                  {t("btn_login")}
                </button>
              </div>
              <div className={styles.handleSituation}>
                <a href="/user/reg">{t("tips_register_welcome")}</a>
                <a href="/userpage/pwd/retrieve">{t("tips_forget_pwd")}</a>
              </div>
            </form>
          </div>
          <div id="email" className={styles.tabcontent}>
            <h5>{t("title_login")}</h5>
            <form
              method="post"
              className={styles.loginElement}
              onSubmit={(e) => handleEmailLogin(e)}
            >
              <div className={styles.phoneInputGroup}>
                <input
                  type="text"
                  ref={emailInputRef}
                  id="email"
                  className={styles.phoneInput}
                  placeholder={t("tips_input_email")}
                />
              </div>
              {emailLoginMode === "pwd" ? (
                <div className={styles.pwd}>
                  <input
                    type={emailPwdShown ? "text" : "password"}
                    ref={emailPwdInputRef}
                    placeholder={t("tips_password")}
                    name="p"
                  ></input>
                  <button onClick={toggleEmailPwdVisibility}>
                    {emailPwdShown ? "👁️" : "🔒"}
                  </button>
                </div>
              ) : (
                <div className={styles.verifyCodeRow}>
                  <input
                    type="text"
                    ref={emailCodeInputRef}
                    placeholder={t("label_verify_code")}
                  />
                  {renderEmailCodeAction()}
                </div>
              )}
              <button
                type="button"
                className={styles.modeSwitch}
                onClick={() => {
                  setEmailLoginMode(
                    emailLoginMode === "pwd" ? "code" : "pwd"
                  );
                }}
              >
                {emailLoginMode === "pwd"
                  ? t("btn_login_by_code")
                  : t("btn_login_by_pwd")}
              </button>
              <div>
                <Turnstile
                  className={styles.turnstile}
                  sitekey={props.cfSiteKey}
                  onVerify={(token) => {
                    setCfVerifyToken(token);
                  }}
                  onExpire={() => {
                    resetTurnstile();
                  }}
                  onError={() => {
                    resetTurnstile();
                  }}
                />
              </div>
              <div className={styles.operate}>
                <button className={styles.loginButton} type="submit">
                  {t("btn_login")}
                </button>
              </div>
              <div className={styles.handleSituation}>
                <a href="/user/reg">{t("tips_register_welcome")}</a>
              </div>
            </form>
          </div>
          <div id="wechat" className={styles.tabcontent}></div>
          <div id="alipay" className={styles.tabcontent}></div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default RdTeXHubLogin;
