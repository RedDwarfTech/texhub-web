import { TexDocModel } from "@/model/doc/TexDocModel";
import { DocActionType } from "@/redux/action/doc/DocAction";
import { TemplateActionType } from "@/redux/action/tpl/TemplateAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getTplList(tag: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/tpl/list?tag=' + tag,
    };
    const actionTypeString: string = TemplateActionType[TemplateActionType.GET_TPL_LIST];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getTplDetail(id: number) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/tpl/detail?id=' + id,
    };
    const actionTypeString: string = TemplateActionType[TemplateActionType.GET_TPL_DETAIL];
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