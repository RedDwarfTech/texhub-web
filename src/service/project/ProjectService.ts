import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getProjectList(tag: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/project/list?tag=' + tag,
    };
    const actionTypeString: string = ProjectActionType[ProjectActionType.GET_PROJ_LIST];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function createDoc(doc: TexProjectModel) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/tex/project/add',
        data: JSON.stringify(doc)
    };
    const actionTypeString: string = ProjectActionType[ProjectActionType.CREATE_DOC];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function deleteProject(proj: any) {
    const config: AxiosRequestConfig = {
        method: 'delete',
        url: '/tex/project/del',
        data: JSON.stringify(proj)
    };
    const actionTypeString: string = ProjectActionType[ProjectActionType.DELETE_PROJ];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function compileProject(proj: any) {
    const config: AxiosRequestConfig = {
        method: 'put',
        url: '/tex/project/compile',
        data: JSON.stringify(proj)
    };
    const actionTypeString: string = ProjectActionType[ProjectActionType.COMPILE_PROJ];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getLatestCompile(project_id: string) {
    const params = new URLSearchParams();
    params.append("project_id",project_id);
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/project/pdf',
        params: params
    };
    const actionTypeString: string = ProjectActionType[ProjectActionType.LATEST_COMPILE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}