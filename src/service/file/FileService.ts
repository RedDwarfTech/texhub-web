import { TexFileModel } from "@/model/file/TexFileModel";
import { FileActionType } from "@/redux/action/file/FileAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getFileList(parent: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/file/tree?parent=' + parent,
    };
    const actionTypeString: string = FileActionType[FileActionType.GET_FILE_TREE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getMainFile(projectId: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/file/main?project_id=' + projectId,
    };
    const actionTypeString: string = FileActionType[FileActionType.GET_MAIN_FILE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getFileCode(fileId: string) {
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/file/code?file_id=' + fileId,
    };
    const actionTypeString: string = FileActionType[FileActionType.GET_FILE_CODE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function updateFileInit(fileId: string) {
    const params = new URLSearchParams();
    params.append("file_id",fileId);
    let req = {
        file_id: fileId
    };
    const config: AxiosRequestConfig = {
        method: 'put',
        url: '/tex/file/inited',
        data: JSON.stringify(req)
    };
    const actionTypeString: string = FileActionType[FileActionType.UPDATE_FILE_INITIAL];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function addFile(params: any) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/tex/file/add?parent=' + parent,
        data: JSON.stringify(params)
    };
    const actionTypeString: string = FileActionType[FileActionType.ADD_FILE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function delTreeItem(params: any) {
    const config: AxiosRequestConfig = {
        method: 'delete',
        url: '/tex/file/del',
        data: JSON.stringify(params)
    };
    const actionTypeString: string = FileActionType[FileActionType.ADD_FILE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function chooseFile(file: TexFileModel) {
    const actionTypeString: string = FileActionType[FileActionType.CHOOSE_FILE];
    return XHRClient.dispathAction(file, actionTypeString, store);
}

export function switchFile(file: TexFileModel) {
    const actionTypeString: string = FileActionType[FileActionType.SWITCH_EDITOR_FILE];
    return XHRClient.dispathAction(file, actionTypeString, store);
}