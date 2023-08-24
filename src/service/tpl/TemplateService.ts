import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import { TemplateActionType } from "@/redux/action/tpl/TemplateAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getTplList(name: string,tplType?: string) {
    const params = new URLSearchParams();
    if(name){
        params.append("name",name);
    }   
    if(tplType){
        params.append("tplType",tplType);
    }
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/tpl/list',
        params: params
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

export function createDoc(doc: TexProjectModel) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/tex/doc/add',
        data: JSON.stringify(doc)
    };
    const actionTypeString: string = ProjectActionType[ProjectActionType.CREATE_DOC];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}