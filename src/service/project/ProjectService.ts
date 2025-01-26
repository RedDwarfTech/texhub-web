import TexFileUtil from "@/common/TexFileUtil";
import { TexFileModel } from "@/model/file/TexFileModel";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { LatestCompile } from "@/model/proj/LatestCompile";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { CompileProjLog } from "@/model/request/proj/CompileProjLog";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CreateProjReq } from "@/model/request/proj/create/CreateProjReq";
import { JoinProjReq } from "@/model/request/proj/JoinProjReq";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { CreateTplProjReq } from "@/model/request/proj/create/CreateTplProjReq";
import { ArchiveProjReq } from "@/model/request/proj/edit/ArchiveProjReq";
import { EditProjReq } from "@/model/request/proj/edit/EditProjReq";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import { QueryPdfPos } from "@/model/request/proj/query/QueryPdfPos";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { QuerySrcPos } from "@/model/request/proj/query/QuerySrcPos";
import { ProjectActionType } from "@/redux/action/project/ProjectAction";
import store from "@/redux/store/store";
import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";
import { AuthHandler, RequestHandler } from "rdjs-wheel";
import { TrashProjReq } from "@/model/request/proj/edit/TrashProjReq";
import { QueryDownload } from "@/model/request/proj/query/QueryDownload";
import { CreateFolder } from "@/model/request/proj/create/CreateFolder";
import { MoveProjReq } from "@/model/request/proj/edit/MoveProjReq";
import { CopyProjReq } from "@/model/request/proj/edit/CopyProjReq";
import { RenameFolderReq } from "@/model/request/proj/edit/RenameFolderReq";
import { DelFolderReq } from "@/model/request/proj/edit/DelFolderReq";
import { QueryHistoryDetail } from "@/model/request/proj/query/QueryHistoryDetail";
import { RemoteCompileResult } from "@/model/proj/RemoteCompileResult";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { PreviewActionType } from "@/redux/action/project/preview/PreviewAction";

export function getProjectList(req: QueryProjReq) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/list",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_PROJ_LIST];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getProjectInfo(req: QueryProjInfo) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/info",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_PROJ_INFO];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function createProject(doc: CreateProjReq) {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/project/add",
    data: JSON.stringify(doc),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.CREATE_DOC];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function createFolder(doc: CreateFolder) {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/project/folder",
    data: JSON.stringify(doc),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.CREATE_FOLDER];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function uploadProjectFile(
  doc: File,
  project_id: string,
  parent: string
) {
  const formData = new FormData();
  formData.append("file", doc);
  formData.append("project_id", project_id);
  formData.append("parent", parent);
  const config: AxiosRequestConfig = {
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    url: "/tex/ul/file/upload",
    data: formData,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.UPLOAD_PROJ_FILE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function uploadProject(doc: File) {
  const formData = new FormData();
  formData.append("file", doc);
  const config: AxiosRequestConfig = {
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    url: "/tex/ul/proj/upload",
    data: formData,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.UPLOAD_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function importGitHubProject(url: string, mainFile: string) {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/project/github/import",
    data: {
      url: url,
      main_file: mainFile,
    },
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.IMPORT_GITHUB_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function createProjectFromTpl(doc: CreateTplProjReq) {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/project/add-from-tpl",
    data: JSON.stringify(doc),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.CREATE_DOC];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function joinProject(req: JoinProjReq) {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/project/join",
    data: JSON.stringify(req),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.JOIN_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function deleteProject(proj: any) {
  const config: AxiosRequestConfig = {
    method: "delete",
    url: "/tex/project/",
    data: JSON.stringify(proj),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.DELETE_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function editProject(proj: EditProjReq) {
  const config: AxiosRequestConfig = {
    method: "patch",
    url: "/tex/project/edit",
    data: JSON.stringify(proj),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.RENAME_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function renameFolder(proj: RenameFolderReq) {
  const config: AxiosRequestConfig = {
    method: "patch",
    url: "/tex/project/folder/rename",
    data: JSON.stringify(proj),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.RENAME_FOLDER];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function delFolder(proj: DelFolderReq) {
  const config: AxiosRequestConfig = {
    method: "delete",
    url: "/tex/project/folder/del",
    data: JSON.stringify(proj),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.RENAME_FOLDER];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function moveProject(proj: MoveProjReq) {
  const config: AxiosRequestConfig = {
    method: "patch",
    url: "/tex/project/move",
    data: JSON.stringify(proj),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.MOVE_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getFolderProject(folder_id: number, proj_type: number) {
  const config: AxiosRequestConfig = {
    method: "get",
    url:
      "/tex/project/perfolder?folder_id=" +
      folder_id +
      "&proj_type=" +
      proj_type,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_FOLDER_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function compileProject(proj: CompileQueueReq) {
  const config: AxiosRequestConfig = {
    method: "put",
    url: "/tex/project/compile",
    data: JSON.stringify(proj),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.COMPILE_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function compileProjectLog(projLog: CompileProjLog) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(projLog)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/compile/log",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_COMPILE_LOG];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function updatePdfUrl(pdfUrl: string) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.RENDER_PDF];
  return XHRClient.dispathAction(pdfUrl, actionTypeString, store);
}

export function getLatestCompile(project_id: string) {
  const params = new URLSearchParams();
  params.append("project_id", project_id);
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/latest/pdf",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.LATEST_COMPILE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getTempAuthCode() {
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/temp/code",
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_TEMP_AUTH_CODE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getCompQueueStatus(id: number) {
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/queue/status?id=" + id,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_COMP_QUEUE_STATUS];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function sendQueueCompileRequest(req: CompileQueueReq) {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/project/compile/queue",
    data: JSON.stringify(req),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.ADD_QUEUE_COMPILE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getPdfPosition(req: QueryPdfPos) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/pos/pdf",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_PDF_POSITION];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getSrcPosition(req: QuerySrcPos) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/pos/src",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_SRC_POSITION];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getStreamLog(params: CompileProjLog) {
  if (AuthHandler.isTokenNeedRefresh(60)) {
    RequestHandler.handleWebAccessTokenExpire().then((data) => {
      doCompile(params);
    });
  } else {
    doCompile(params);
  }
}

export function doCompile(params: CompileProjLog) {
  var queryString = Object.keys(params)
    .map((key) => key + "=" + params[key as keyof CompileProjLog])
    .join("&");
  let eventNative = new EventSource(
    "/tex/project/compile/log/stream?" + queryString
  );
  eventNative.onopen = () => {};
  eventNative.onerror = (error: any) => {
    console.log("compile project error", error);
    eventNative.close();
  };
  eventNative.onmessage = (event: any) => {
    updateLogText(event.data);
  };

  eventNative.addEventListener("TEX_COMP_LOG", function (event: any) {
    updateLogText(event.data);
  });

  eventNative.addEventListener("TEX_COMP_END", function (event: any) {
    const actionTypeString: string =
      ProjectActionType[ProjectActionType.TEX_COMP_END];
    eventNative.close();
    setContextCompileStatus(CompileStatus.COMPLETE);
    return XHRClient.dispathAction(event.data, actionTypeString, store);
  });
}

export function updateLogText(logContent: string) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.APPEND_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}

export function changeProjConf(projConf: ProjConf) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.CHANGE_PROJ_CONF];
  return XHRClient.dispathAction(projConf, actionTypeString, store);
}

export function clearCompLogText(logContent: string) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.CLEAR_COMP_LOG];
  return XHRClient.dispathAction(logContent, actionTypeString, store);
}

export function showPreviewTab(tabName: string) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.SHOW_PREVIEW_TAB];
  return XHRClient.dispathAction(tabName, actionTypeString, store);
}

export function delProjInfo() {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.DELETE_PROJ_INFO];
  return XHRClient.dispathAction("", actionTypeString, store);
}

export function setContextCompileStatus(compStatus: CompileStatus) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.SET_COMPILE_STATUS];
  return XHRClient.dispathAction(compStatus, actionTypeString, store);
}

export function setContextCompileResultType(compResult: CompileResultType) {
  const actionTypeString: string =
    ProjectActionType[PreviewActionType.SET_COMPILE_RESULT_TYPE];
  return XHRClient.dispathAction(compResult, actionTypeString, store);
}

export function setLatestCompile(data: LatestCompile) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.LATEST_COMPILE];
  return XHRClient.dispathAction(data, actionTypeString, store);
}

export function setCompileQueue(data: CompileQueue) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.GET_COMP_QUEUE_STATUS];
  return XHRClient.dispathAction(data, actionTypeString, store);
}

export function shareProj() {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.SHARE_PROJ];
  return XHRClient.dispathAction("", actionTypeString, store);
}

export function insertTextToEditor(text: string) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.EDITOR_INSERT_TEXT];
  return XHRClient.dispathAction(text, actionTypeString, store);
}

export function replaceTextToEditor(text: string) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.EDITOR_REPLACE_TEXT];
  return XHRClient.dispathAction(text, actionTypeString, store);
}

export function setProjAttr(data: PreviewPdfAttribute) {
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.PROJ_ATTR];
  return XHRClient.dispathAction(data, actionTypeString, store);
}

export function getProjHistoryDetail(history: QueryHistoryDetail) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(history)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/fileversion/detail",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.PROJ_HISTORY_DETAIL];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function projHistoryPage(history: QueryHistory) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(history)) {
    params.append(key, value);
  }
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/project/history/page",
    params: params,
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.PROJ_HISTORY_PAGE];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function getCachedProjInfo(projId: string) {
  let legacyTree = localStorage.getItem("projTree:" + projId);
  if (legacyTree == null) {
    return;
  }
  let treeNode: TexFileModel[] = JSON.parse(legacyTree);
  return treeNode;
}

export function projHasFile(fileId: string, projId: string) {
  let cachedItems = getCachedProjInfo(projId);
  if (cachedItems == null) return false;
  const result = TexFileUtil.searchTreeNode(cachedItems, fileId);
  return result;
}

export function archiveProj(req: ArchiveProjReq) {
  const config: AxiosRequestConfig = {
    method: "put",
    url: "/tex/project/archive",
    data: JSON.stringify(req),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.ARCHIVE_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function trashProj(req: TrashProjReq) {
  const config: AxiosRequestConfig = {
    method: "put",
    url: "/tex/project/trash",
    data: JSON.stringify(req),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.TRASH_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function downloadProj(req: QueryDownload) {
  const config: AxiosRequestConfig = {
    method: "put",
    url: "/tex/project/download",
    data: JSON.stringify(req),
    // https://stackoverflow.com/questions/77741285/uncaught-in-promise-typeerror-failed-to-execute-createobjecturl-on-url-o
    responseType: "blob",
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.DOWNLOAD_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}

export function copyProj(req: CopyProjReq) {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/project/copy",
    data: JSON.stringify(req),
  };
  const actionTypeString: string =
    ProjectActionType[ProjectActionType.COPY_PROJ];
  return XHRClient.requestWithActionType(config, actionTypeString, store);
}
