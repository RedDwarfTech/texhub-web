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

export function addFile(params: any) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/tex/file/add?parent=' + parent,
        data: JSON.stringify(params)
    };
    const actionTypeString: string = FileActionType[FileActionType.ADD_FILE];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}