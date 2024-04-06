import { EditSnippetReq } from "@/model/request/snippet/edit/EditSnippetReq";
import { QuerySnippetReq } from "@/model/request/snippet/query/QuerySnippetReq";
import { SnippetActionType } from "@/redux/action/snippet/SnippetAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

export function getSnippetList(req: QuerySnippetReq) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req)) {
        params.append(key, value);
    }
    const config: AxiosRequestConfig = {
        method: 'get',
        url: '/tex/snippet/list',
        params: params
    };
    const actionTypeString: string = SnippetActionType[SnippetActionType.GET_SNIPPET_LIST];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function addSnippet(req: EditSnippetReq) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/tex/snippet/add',
        data: JSON.stringify(req)
    };
    const actionTypeString: string = SnippetActionType[SnippetActionType.ADD_SNIPPET];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}