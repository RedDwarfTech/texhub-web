import { TexDocModel } from "@/model/doc/TexDocModel";
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

export function createDoc(doc: TexDocModel) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/tex/doc/add',
        data: JSON.stringify(doc)
    };
    const actionTypeString: string = DocActionType[DocActionType.CREATE_DOC];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}