import { AppConfigActionType } from "@/redux/action/profile/AppConfigAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function saveGithubToken(token: string) {
  const config: AxiosRequestConfig = {
    method: "put",
    url: "/tex/profile/github",
    data: {
      token: token,
    },
  };
  const actionTypeString: string =
    AppConfigActionType[AppConfigActionType.SAVE_GITHUB_TOKEN];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}
