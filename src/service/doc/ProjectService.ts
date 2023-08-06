import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { DocActionType } from "@/redux/action/doc/DocAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getProjectList(tag: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/project/list?tag=' + tag,
    };
    const actionTypeString: string = DocActionType[DocActionType.GET_DOC_LIST];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function createDoc(doc: TexProjectModel) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/tex/doc/add',
        data: JSON.stringify(doc)
    };
    const actionTypeString: string = DocActionType[DocActionType.CREATE_DOC];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}