import { CompileProjReq } from "@/model/request/proj/CompileProjReq copy";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CreateProjReq } from "@/model/request/proj/CreateProjReq";
import { JoinProjReq } from "@/model/request/proj/JoinProjReq";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";
import { AuthHandler, RequestHandler } from 'rdjs-wheel';

export function getProjectList(tag: string) {
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/list?tag=' + tag,
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

export function compileProjectStream(proj: any) {
  const config: AxiosRequestConfig = {
    method: 'put',
    url: '/tex/project/log/stream',
    data: JSON.stringify(proj)
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.COMPILE_PROJ];
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

export function sendCompileRequest(req: CompileQueueReq) {
  const config: AxiosRequestConfig = {
    method: 'post',
    url: '/tex/project/compile/queue',
    data: JSON.stringify(req)
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_TEMP_AUTH_CODE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function doCompilePreCheck(params: CompileProjReq, onSseMessage: (msg: string, eventSource: EventSource) => void) {
  if (AuthHandler.isTokenNeedRefresh(60)) {
    RequestHandler.handleWebAccessTokenExpire()
      .then((data) => {
        doCompile(params, onSseMessage);
      });
  } else {
    doCompile(params, onSseMessage);
  }
}

export function doCompile(params: CompileProjReq, onSseMessage: (msg: string, eventSource: EventSource) => void) {
  var queryString = Object.keys(params).map(key => key + '=' + params[key as keyof CompileProjReq]).join('&');
  let eventNative = new EventSource('/tex/project/log/stream?' + queryString);
  eventNative.onopen = () => {
  }
  eventNative.onerror = (error: any) => {
    console.log("compile project error", error);
    eventNative.close();
  }
  eventNative.onmessage = (event: any) => {
    onSseMessage(event.data, eventNative);
  };

  eventNative.addEventListener("TEX_COMP_LOG", function(event: any) {
    onSseMessage(event.data, eventNative);
  });

  eventNative.addEventListener("TEX_COMP_END", function() {
    const actionTypeString: string = ProjectActionType[ProjectActionType.TEX_COMP_END];
  return XHRClient.dispathAction("TEX_COMP_END", actionTypeString, store);
    eventNative.close();
  });
}

export function updateLogText(logContent: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.APPEND_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}

export function clearCompLogText(logContent: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.APPEND_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}