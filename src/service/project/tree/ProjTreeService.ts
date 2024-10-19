import { QueryFile } from "@/model/request/proj/search/QueryFile";
import { ProjectTreeActionType } from "@/redux/action/project/tree/ProjectTreeAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function projSerach(req: QueryFile) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/search",
    params: params,
  };
  const actionTypeString: string =
    ProjectTreeActionType[ProjectTreeActionType.PROJ_SEARCH];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}
