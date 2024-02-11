import { QuerySnippetReq } from "@/model/request/snippet/query/QuerySnippetReq";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
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
    const actionTypeString: string = ProjectActionType[SnippetActionType.GET_SNIPPET];
    return XHRClient.requestWithActionType(config, actionTypeString, store);
}
