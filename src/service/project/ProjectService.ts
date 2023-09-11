import { CompileProjLog } from "@/model/request/proj/CompileProjLog";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CreateProjReq } from "@/model/request/proj/CreateProjReq";
import { JoinProjReq } from "@/model/request/proj/JoinProjReq";
import { QueryProjReq } from "@/model/request/proj/QueryProjReq";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";
import { AuthHandler, BaseMethods, RequestHandler } from 'rdjs-wheel';

export function getProjectList(req: QueryProjReq) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/list',
    params: params
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_PROJ_LIST];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function createProject(doc: CreateProjReq) {
  const config: AxiosRequestConfig = {
    method: 'post',
    url: '/tex/project/add',
    data: JSON.stringify(doc)
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.CREATE_DOC];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function joinProject(req: JoinProjReq) {
  const config: AxiosRequestConfig = {
    method: 'post',
    url: '/tex/project/join',
    data: JSON.stringify(req)
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.JOIN_PROJ];
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

export function compileProject(proj: CompileQueueReq) {
  const config: AxiosRequestConfig = {
    method: 'put',
    url: '/tex/project/compile',
    data: JSON.stringify(proj)
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.COMPILE_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function compileProjectLog(projLog: CompileProjLog) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(projLog)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/compile/log',
    params: params,
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_COMPILE_LOG];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function updatePdfUrl(pdfUrl: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.RENDER_PDF];
  return XHRClient.dispathAction(pdfUrl, actionTypeString, store);
}

export function getLatestCompile(project_id: string) {
  const params = new URLSearchParams();
  params.append("project_id", project_id);
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/pdf',
    params: params
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.LATEST_COMPILE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getTempAuthCode() {
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/temp/code',
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_TEMP_AUTH_CODE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getCompQueueStatus(id: number) {
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/queue/status?id=' + id,
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_COMP_QUEUE_STATUS];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function sendQueueCompileRequest(req: CompileQueueReq) {
  const config: AxiosRequestConfig = {
    method: 'post',
    url: '/tex/project/compile/queue',
    data: JSON.stringify(req)
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.ADD_QUEUE_COMPILE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function doCompileLogPreCheck(params: CompileProjLog, onSseMessage: (msg: string, eventSource: EventSource) => void) {
  if (AuthHandler.isTokenNeedRefresh(60)) {
    RequestHandler.handleWebAccessTokenExpire()
      .then((data) => {
        doCompile(params, onSseMessage);
      });
  } else {
    doCompile(params, onSseMessage);
  }
}

export function doCompile(params: CompileProjLog, onSseMessage: (msg: string, eventSource: EventSource) => void) {
  var queryString = Object.keys(params).map(key => key + '=' + params[key as keyof CompileProjLog]).join('&');
  let eventNative = new EventSource('/tex/project/compile/log/stream?' + queryString);
  eventNative.onopen = () => {
  }
  eventNative.onerror = (error: any) => {
    console.log("compile project error", error);
    eventNative.close();
  }
  eventNative.onmessage = (event: any) => {
    onSseMessage(event.data, eventNative);
  };

  eventNative.addEventListener("TEX_COMP_LOG", function (event: any) {
    onSseMessage(event.data, eventNative);
  });

  eventNative.addEventListener("TEX_COMP_END", function (event: any) {
    const actionTypeString: string = ProjectActionType[ProjectActionType.TEX_COMP_END];
    eventNative.close();
    let randomStr = BaseMethods.genRandomStr(6);
    return XHRClient.dispathAction(randomStr, actionTypeString, store);
  });
}

export function updateLogText(logContent: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.APPEND_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}

export function clearCompLogText(logContent: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.CLEAR_COMP_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}

export function showPreviewTab(tabName: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.SHOW_PREVIEW_TAB];
  return XHRClient.dispathAction(tabName, actionTypeString, store);
}