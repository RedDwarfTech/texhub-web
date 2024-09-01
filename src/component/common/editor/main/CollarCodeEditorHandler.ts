import { TexFileModel } from "@/model/file/TexFileModel";
import { QueryPdfPos } from "@/model/request/proj/query/QueryPdfPos";
import { EditorView } from "codemirror";
import { BaseMethods } from "rdjs-wheel";
import { EditorProps } from "./CollarCodeEditor";
import { toast } from "react-toastify";
import { getPdfPosition } from "@/service/project/ProjectService";
import { handleSrcLocate } from "../../previewer/PreviewerHandler";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { ProjectTreeFolder } from "../../projtree/main/ProjectTreeFolder";

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
  selectedFile: TexFileModel
) => {
  if (BaseMethods.isNull(props)) {
    return;
  }
  if (BaseMethods.isNull(curProjInfo)) {
    return;
  }
  let name_paths = ProjectTreeFolder.getNamePaths(props.projectId, selectedFile.file_id);
  debugger;
  ProjectTreeFolder.handleExpandFolder(
    name_paths,
    props.projectId,
    selectedFile
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
