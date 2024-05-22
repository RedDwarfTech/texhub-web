import { QueryProjCollar } from "@/model/request/proj/query/QueryProjCollar";
import { ProjectShareActionType } from "@/redux/action/project/share/ProjectShareAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getProjCollarUsers(req: QueryProjCollar) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req)) {
      params.append(key, value);
    }
    const config: AxiosRequestConfig = {
      method: 'get',
      url: '/tex/share/list',
      params: params
    };
    const actionTypeString: string = ProjectShareActionType[ProjectShareActionType.GET_COLLAR_USERS];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
  }
