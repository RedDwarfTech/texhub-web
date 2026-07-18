import { useRef, useState } from "react";
import styles from "./VerifyPwd.module.css";
import { sendVerifySMS, verifySmsCode } from "@/service/project/PwdService";
import { SendVerifyReq } from "@/model/request/pwd/SendVerifyReq";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { VerifyReq } from "@/model/request/pwd/VerifyReq";
import { BaseMethods, ResponseHandler } from "rdjs-wheel";
import CountdownTimer from "./CountdownTimer";
import { readConfig } from "@/config/app/config-reader";
import { SmsRemainInfo } from "@/model/user/SmsRemainInfo";
import TeXHubLogo from "@/assets/icon/texhub-logo.png";
import { useTranslation } from "react-i18next";

const VerifyPwd: React.FC = () => {
  const phoneInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const navigate = useNavigate();
  const [showCountDown, setShowCountDown] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !codeInputRef.current ||
      (codeInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_verify_code"));
      return;
    }
    if (
      !phoneInputRef.current ||
      (phoneInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_type_phone"));
      return;
    }
    let codeValue = (codeInputRef.current as HTMLInputElement).value;
    let phoneValue = (phoneInputRef.current as HTMLInputElement).value;
    let req: VerifyReq = {
      phone: phoneValue,
      verifyCode: codeValue,
    };
    verifySmsCode(req).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        navigate("/userpage/pwd/reset", {
          state: {
            phone: phoneValue,
            code: codeValue,
          },
        });
      } else {
        toast(resp.msg);
      }
    });
  };

  const resetCodeSend = () => {
    setShowCountDown(false);
  };

  const sendverifyCode = () => {
    if (
      !phoneInputRef.current ||
      (phoneInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast(t("tips_input_phone_exclaim"));
      return;
    }
    let phoneValue = (phoneInputRef.current as HTMLInputElement).value;
    let req: SendVerifyReq = {
      phone: phoneValue,
      app_id: readConfig("appId"),
    };
    sendVerifySMS(req).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        setShowCountDown(true);
      } else {
        toast(resp.msg);
      }
    });
  };

  const renderVerifyCodeAction = () => {
    let remain = localStorage.getItem("sms-remain-seconds");
    if (showCountDown || !BaseMethods.isNull(remain)) {
      if (!BaseMethods.isNull(remain)) {
        let remainObj: SmsRemainInfo = JSON.parse(remain!);
        if (remainObj.createdTime < Date.now() - 60000) {
          localStorage.removeItem("sms-remain-seconds");
          return (
            <button
              type="button"
              className={styles.verifyCodeBtn}
              onClick={() => {
                sendverifyCode();
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
            />
          );
        }
      } else {
        return (
          <CountdownTimer seconds={60} resetCodeSend={() => resetCodeSend()} />
        );
      }
    } else {
      return (
        <button
          type="button"
          className={styles.verifyCodeBtn}
          onClick={() => {
            sendverifyCode();
          }}
        >
          {t("btn_get_verify_code")}
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
      <div className={styles.verifyCodeContainer}>
        <div className={styles.pwdForm}>
          <div className={styles.pwdTabs}>
            <div className={styles.tablinks}>{t("title_retrieve_pwd")}</div>
          </div>
          <div className={styles.tabcontent}>
            <h5>{t("title_retrieve_pwd")}</h5>
            <form
              method="post"
              className={styles.loginElement}
              onSubmit={(e) => handleNextStep(e)}
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
                  name=""
                />
                {renderVerifyCodeAction()}
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
};

export default VerifyPwd;
