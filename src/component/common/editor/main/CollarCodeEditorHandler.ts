import { TexFileModel } from "@/model/file/TexFileModel";
import { QueryPdfPos } from "@/model/request/proj/query/QueryPdfPos";
import { EditorView } from "codemirror";
import { BaseMethods } from "rdjs-wheel";
import { EditorProps } from "./CollarCodeEditor";
import { toast } from "react-toastify";
import { getPdfPosition, projHasFile } from "@/service/project/ProjectService";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { ProjectTreeFolder } from "../../projtree/main/ProjectTreeFolder";
import * as Y from "rdyjs";
import { initSubDocSocketIO } from "@/service/editor/CollarEditorSocketIOService";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { themeMap } from "@/component/common/editor/foundation/extensions/theme/theme";
import { readConfig } from "@/config/app/config-reader";
import logger from "@/common/storage/log/Logger";

export const getCursorPos = (
  editor: EditorView
): { line: number; column: number } => {
  if (editor && editor.state) {
    const cursor = editor.state.selection.main.head;
    const line = editor.state.doc.lineAt(cursor).number;
    const column = cursor - editor.state.doc.line(line).from;
    return {
      line: line,
      column: column,
    };
  } else {
    return {
      line: 1,
      column: 1,
    };
  }
};

export const handleSrcTreeNav = (
  props: EditorProps,
  curProjInfo: ProjInfo,
  selectedFile: TexFileModel,
  ydoc: Y.Doc
) => {
  if (BaseMethods.isNull(props)) {
    return;
  }
  if (BaseMethods.isNull(curProjInfo)) {
    return;
  }
  let name_paths = ProjectTreeFolder.getNamePaths(
    props.projectId,
    selectedFile.file_id
  );
  ProjectTreeFolder.handleExpandFolder(
    name_paths,
    props.projectId,
    selectedFile,
    ydoc
  );
};

export const handlePdfLocate = (
  mainFileModel: TexFileModel | undefined,
  activeEditorView: EditorView | undefined,
  props: EditorProps,
  activeKey: string
) => {
  if (mainFileModel && mainFileModel.name && activeEditorView) {
    let { line, column } = getCursorPos(activeEditorView);
    const selected = localStorage.getItem(
      "proj-select-file:" + props.projectId
    );
    if (!selected) {
      toast.info("请选择文件");
      return;
    }
    let selectFile: TexFileModel = JSON.parse(selected);
    if (BaseMethods.isNull(selectFile)) {
      // if the select file is null, then try to use the current active file
      let activeFile = localStorage.getItem(activeKey);
      if (!activeFile || BaseMethods.isNull(activeFile)) {
        toast.info("请选择文件");
        return;
      }
      selectFile = JSON.parse(activeFile);
    }
    let req: QueryPdfPos = {
      project_id: props.projectId,
      path: selectFile.file_path,
      file: selectFile.name,
      main_file: mainFileModel.name,
      line: line,
      column: column,
    };
    getPdfPosition(req);
  }
};

/**
 * for now, we get the active file from local storage
 * the user want to resume the file when the next time open brower
 * or the next peroid of time, we need to persistant the last edit file
 *
 * @param activeKey
 * @param projInfo
 * @returns
 */
export const getCurActiveFile = (activeKey: string, projInfo: ProjInfo) => {
  const activeFileJson = localStorage.getItem(activeKey);
  if (activeFileJson) {
    const curActiveFile: TexFileModel = JSON.parse(activeFileJson);
    if (!projInfo.main) {
      console.error("main is null", JSON.stringify(projInfo));
      return;
    }
    let contains = projHasFile(curActiveFile.file_id, projInfo.main.project_id);
    if (contains) {
      return curActiveFile;
    }
  }
};

export const initEditor = (projId: string, projInfo: ProjInfo) => {
  if (!projInfo || Object.keys(projInfo).length === 0) {
    console.warn("there is no valid project info");
    return;
  }
  const activeKey = readConfig("projActiveFile") + projId;
  const curActiveFile = getCurActiveFile(activeKey, projInfo);
  if (!curActiveFile) {
    // current has no active file
    // when first time open the project
    // we load the main file
    // record an info log that we will open the main file
    logger.info("当前没有激活文件，默认初始化主文件", { file: curActiveFile });
    preInitEditor(projInfo.main_file, projId);
    return;
  }
  if (!projInfo.main) {
    console.error("main is null", JSON.stringify(projInfo));
    return;
  }
  let contains = projHasFile(curActiveFile.file_id, projInfo.main.project_id);
  if (contains) {
    preInitEditor(curActiveFile, projId);
  } else {
    const warnMsg =
      "当前文件不属于该项目，已为您打开主文件" + JSON.stringify(curActiveFile);
    console.warn(warnMsg);
    // record a warn log to indexeddb
    logger.warn(warnMsg, { file: curActiveFile });
    preInitEditor(projInfo.main_file, projId);
  }
};

const preInitEditor = (loadFile: TexFileModel, projectId: string) => {
  const editorAttr: EditorAttr = {
    projectId: projectId,
    docIntId: loadFile.id.toString(),
    docId: loadFile.file_id,
    name: loadFile.name,
    theme: themeMap.get("Solarized Light")!,
    docShowName: loadFile.name,
  };
  initSubDocSocketIO(editorAttr, loadFile);
};
