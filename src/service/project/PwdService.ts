import { ResetPwdReq } from "@/model/request/pwd/ResetPwdReq";
import { SendVerifyReq } from "@/model/request/pwd/SendVerifyReq";
import { VerifyReq } from "@/model/request/pwd/VerifyReq";
import { PwdActionType } from "@/redux/action/pwd/PwdAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function sendVerifySMS(doc: SendVerifyReq) {
    const config: AxiosRequestConfig = {
      method: 'put',
      url: '/infra/user/pwd/send-verify-code',
      data: JSON.stringify(doc)
    };
    const actionTypeString: string = PwdActionType[PwdActionType.SEND_VERIFY_CODE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function verifySmsCode(doc: VerifyReq) {
  const config: AxiosRequestConfig = {
    method: 'put',
    url: '/infra/user/verify',
    data: JSON.stringify(doc)
  };
  const actionTypeString: string = PwdActionType[PwdActionType.VERIFY];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function resetPwd(doc: ResetPwdReq) {
  const config: AxiosRequestConfig = {
    method: 'put',
    url: '/infra/user/pwd/reset',
    data: JSON.stringify(doc)
  };
  const actionTypeString: string = PwdActionType[PwdActionType.VERIFY];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}