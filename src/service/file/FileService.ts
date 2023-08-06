import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getFileList(parent: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/file/list?parent=' + parent,
    };
    const actionTypeString: string = ProjectActionType[ProjectActionType.GET_PROJ_LIST];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}