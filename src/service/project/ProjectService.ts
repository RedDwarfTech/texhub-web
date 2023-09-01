import { CreateProjReq } from "@/model/request/proj/CreateProjReq";
import { JoinProjReq } from "@/model/request/proj/JoinProjReq";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";
import { EventSourcePolyfill } from 'event-source-polyfill';
import { AuthHandler, RequestHandler } from 'rdjs-wheel';
import { v4 as uuid } from 'uuid';
import { CompileProjReq } from "@/model/request/proj/CompileProjReq";

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

export function compileProject(proj: CompileProjReq) {
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

export function doCompilePreCheck(params: CompileProjReq, onSseMessage: (msg: string, eventSource: EventSourcePolyfill) => void) {
  if (AuthHandler.isTokenNeedRefresh(60)) {
    RequestHandler.handleWebAccessTokenExpire()
      .then((data) => {
        doSseChatAsk(params, onSseMessage);
      });
  } else {
    doSseChatAsk(params, onSseMessage);
  }
}

export function doCompile(params: CompileProjReq, onSseMessage: (msg: string, eventSource: EventSourcePolyfill) => void) {
  var queryString = Object.keys(params).map(key => key + '=' + params[key as keyof CompileProjReq]).join('&');
  const eventNative: EventSource = new EventSource('/tex/project/log/stream?' + queryString, {
    //headers: { 'Content-Type': 'application/'}
  });
  eventNative.onmessage = function (event) {
    console.log(event.data);
  };
}

export function doSseChatAsk(params: CompileProjReq, onSseMessage: (msg: string, eventSource: EventSourcePolyfill) => void) {
  let eventSource: EventSourcePolyfill;
  const accessToken = localStorage.getItem("x-access-token");
  var queryString = Object.keys(params).map(key => key + '=' + params[key as keyof CompileProjReq]).join('&');
  eventSource = new EventSourcePolyfill('/tex/project/log/stream?' + queryString, {
    headers: {
      'x-access-token': accessToken ?? "",
      'x-request-id': uuid()
    }
  });
  eventSource.onopen = () => {

  }
  eventSource.onerror = (error: any) => {
    console.log("compile project error", error);
    eventSource.close();
  }
  eventSource.onmessage = (e: any) => {
    debugger
    onSseMessage(e.data, eventSource);
  };
}

