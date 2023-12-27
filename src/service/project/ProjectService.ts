import TexFileUtil from "@/common/TexFileUtil";
import { TexFileModel } from "@/model/file/TexFileModel";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { LatestCompile } from "@/model/proj/LatestCompile";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { CompileProjLog } from "@/model/request/proj/CompileProjLog";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CreateProjReq } from "@/model/request/proj/CreateProjReq";
import { JoinProjReq } from "@/model/request/proj/JoinProjReq";
import { QueryProjReq } from "@/model/request/proj/QueryProjReq";
import { CreateTplProjReq } from "@/model/request/proj/create/CreateTplProjReq";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import { QueryPdfPos } from "@/model/request/proj/query/QueryPdfPos";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { QuerySrcPos } from "@/model/request/proj/query/QuerySrcPos";
import { QueryFile } from "@/model/request/proj/search/QueryFile";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";
import { AuthHandler, RequestHandler } from 'rdjs-wheel';

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

export function getProjectInfo(req: QueryProjInfo) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/info',
    params: params
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_PROJ_INFO];
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

export function uploadProjectFile(doc: File, project_id: string, parent: string) {
  const formData = new FormData();
  formData.append('file', doc);
  formData.append('project_id', project_id);
  formData.append('parent', parent);
  const config: AxiosRequestConfig = {
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    url: '/tex/project/file/upload',
    data: formData
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.UPLOAD_PROJ_FILE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function createProjectFromTpl(doc: CreateTplProjReq) {
  const config: AxiosRequestConfig = {
    method: 'post',
    url: '/tex/project/add-from-tpl',
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

export function editProject(proj: any) {
  const config: AxiosRequestConfig = {
    method: 'patch',
    url: '/tex/project/edit',
    data: JSON.stringify(proj)
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.RENAME_PROJ];
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
    url: '/tex/project/latest/pdf',
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

export function getPdfPosition(req: QueryPdfPos) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/pos/pdf',
    params: params
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_PDF_POSITION];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getSrcPosition(req: QuerySrcPos) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/pos/src',
    params: params
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_SRC_POSITION];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getStreamLog(params: CompileProjLog, onSseMessage: (msg: string, eventSource: EventSource) => void) {
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
    setCompileStatus(CompileStatus.COMPLETE);
    return XHRClient.dispathAction(event.data, actionTypeString, store);
  });
}

export function updateLogText(logContent: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.APPEND_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}

export function changeProjConf(projConf: ProjConf) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.CHANGE_PROJ_CONF];
  return XHRClient.dispathAction(projConf, actionTypeString, store);
}

export function clearCompLogText(logContent: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.CLEAR_COMP_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}

export function showPreviewTab(tabName: string) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.SHOW_PREVIEW_TAB];
  return XHRClient.dispathAction(tabName, actionTypeString, store);
}

export function delProjInfo() {
  const actionTypeString: string = ProjectActionType[ProjectActionType.DELETE_PROJ_INFO];
  return XHRClient.dispathAction("", actionTypeString, store);
}

export function setCompileStatus(compStatus: CompileStatus) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.SET_COMPILE_STATUS];
  return XHRClient.dispathAction(compStatus, actionTypeString, store);
}

export function setLatestCompile(data: LatestCompile) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.LATEST_COMPILE];
  return XHRClient.dispathAction(data, actionTypeString, store);
}

export function setCompileQueue(data: CompileQueue) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.GET_COMP_QUEUE_STATUS];
  return XHRClient.dispathAction(data, actionTypeString, store);
}

export function shareProj() {
  const actionTypeString: string = ProjectActionType[ProjectActionType.SHARE_PROJ];
  return XHRClient.dispathAction("", actionTypeString, store);
}

export function setProjAttr(data: ProjAttribute) {
  const actionTypeString: string = ProjectActionType[ProjectActionType.PROJ_ATTR];
  return XHRClient.dispathAction(data, actionTypeString, store);
}

export function projSerach(req: QueryFile) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/search',
    params: params
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.PROJ_SEARCH];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function projHistory(history: QueryHistory) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(history)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/tex/project/history',
    params: params
  };
  const actionTypeString: string = ProjectActionType[ProjectActionType.PROJ_HISTORY];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getCachedProjInfo(projId: string){
  let legacyTree = localStorage.getItem('projTree:' + projId);
  if (legacyTree == null) {
      return;
  }
  let treeNode: TexFileModel[] = JSON.parse(legacyTree);
  return treeNode;
}

export function projHasFile(fileId: string, projId: string){
  let cachedItems = getCachedProjInfo(projId);
  if(cachedItems == null) return false;
  const result = TexFileUtil.searchTreeNode(cachedItems, fileId);
  return result;
}
