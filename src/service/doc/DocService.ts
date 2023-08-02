import { DocActionType } from "@/redux/action/doc/DocAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getDocList(tag: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/doc/list?tag=' + tag,
    };
    const actionTypeString: string = DocActionType[DocActionType.GET_DOC_LIST];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}