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

const VerifyPwd: React.FC = () => {
  const phoneInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const navigate = useNavigate();
  const [showCountDown, setShowCountDown] = useState<boolean>(false);

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    // https://stackoverflow.com/questions/78001281/why-the-react-cllient-axios-send-http-with-an-extended-local-url
    e.preventDefault();
    if (
      !codeInputRef.current ||
      (codeInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast("请输入验证码");
      return;
    }
    if (
      !phoneInputRef.current ||
      (phoneInputRef.current as HTMLInputElement).value.length === 0
    ) {
      toast("请输入手机号码");
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
        // https://reactrouter.com/en/main/hooks/use-navigate
        navigate("/userpage/pwd/reset" + phoneValue,{
          state: {
            phone: phoneValue,
            code: codeValue
          }
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
      toast("请输入手机号码!");
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
        if(remainObj.createdTime < Date.now() - 60000) {
          localStorage.removeItem("sms-remain-seconds");
          return (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                sendverifyCode();
              }}
            >
              获取验证码
            </button>
          );
        }else{
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
          className="btn btn-primary"
          onClick={() => {
            sendverifyCode();
          }}
        >
          获取验证码
        </button>
      );
    }
  };

  return (
    <div className={styles.verifyCodeContainer}>
      <div id="phone" className={styles.tabcontent}>
        <h5>找回密码</h5>
        <form
          method="post"
          className={styles.loginElement}
          onSubmit={(e) => handleNextStep(e)}
        >
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
          {renderVerifyCodeAction()}
          <div className={styles.password}>
            <input
              type="text"
              ref={codeInputRef}
              placeholder="验证码"
              name=""
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
};

export default VerifyPwd;
