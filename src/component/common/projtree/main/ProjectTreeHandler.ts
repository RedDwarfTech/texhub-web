import { TexFileModel } from "@/model/file/TexFileModel";
import { addFile, chooseFile, switchFile } from "@/service/file/FileService";
import { validateFileName } from "@/service/file/FileNameValidator";
import { ProjectTreeFolder } from "./ProjectTreeFolder";
import { toast } from "react-toastify";
import i18n from "i18next";
import { TeXFileType } from "@/model/enum/TeXFileType";
import { BaseMethods } from "rdjs-wheel";
import * as bootstrap from "bootstrap";
import * as Y from "rdyjs";
import { EditorView } from "@codemirror/view";
import {
  forceSetCurSubDoc,
  isEditorSyncedWithFile,
  setCurRootYDoc,
} from "@/service/project/editor/EditorService";
import store from "@/redux/store/store.js";

export function handleFileTreeUpdate(
  tree: TexFileModel[],
  projectId: string,
  setTexFileTree: (value: TexFileModel[]) => void
) {
  if (!tree || tree.length === 0) {
    return;
  }
  let legacyTree = localStorage.getItem("projTree:" + projectId);
  if (legacyTree) {
    // do the tree expand field merge
    let cacheTree = JSON.parse(legacyTree);
    ProjectTreeFolder.mergeTreeExpand(tree, cacheTree);
    setTexFileTree(tree);
  } else {
    setTexFileTree(tree);
  }
  localStorage.setItem("projTree:" + projectId, JSON.stringify(tree));
}

export function handleExpandFolderEvent(
  e: React.MouseEvent<HTMLElement>,
  item: TexFileModel,
  texFileTree: TexFileModel[],
  setTexFileTree: (value: TexFileModel[]) => void
) {
  e.preventDefault();
  e.stopPropagation();
  if (!texFileTree || texFileTree.length === 0) return;
  const updatedItems = ProjectTreeFolder.handleExpandClick(
    item.file_id,
    texFileTree
  );
  localStorage.setItem(
    "projTree:" + item.project_id,
    JSON.stringify(updatedItems)
  );
  setTexFileTree(updatedItems);
}

function resolveRootYDoc(curRootYDoc?: Y.Doc | null): Y.Doc | null {
  if (
    curRootYDoc &&
    !BaseMethods.isNull(curRootYDoc) &&
    typeof curRootYDoc.getMap === "function"
  ) {
    return curRootYDoc;
  }
  const fromStore = store.getState().projEditor.curRootYDoc;
  if (
    fromStore &&
    !BaseMethods.isNull(fromStore) &&
    typeof fromStore.getMap === "function"
  ) {
    return fromStore;
  }
  return null;
}

export function handleFileSelected(
  newSelectedFile: TexFileModel,
  oldSelectedFile: TexFileModel | null,
  curRootYDoc?: Y.Doc | null
) {
  const sameFileSelected =
    oldSelectedFile &&
    !BaseMethods.isNull(oldSelectedFile) &&
    newSelectedFile.file_id === oldSelectedFile.file_id;

  if (sameFileSelected && isEditorSyncedWithFile(newSelectedFile.file_id)) {
    return;
  }

  chooseFile(newSelectedFile);
  if (newSelectedFile.file_type === TeXFileType.FOLDER) {
    return;
  }

  switchFile(newSelectedFile);

  const rootYDoc = resolveRootYDoc(curRootYDoc);
  if (!rootYDoc) {
    toast.warning(i18n.t("tips_editor_not_ready"));
    return;
  }

  const resyncingSameFile = !!sameFileSelected;
  if (resyncingSameFile) {
    toast.info(i18n.t("tips_file_switch_resync"));
  }

  let subDocs: Y.Map<Y.Doc> = rootYDoc.getMap("texhubsubdoc");
  const { editorView } = store.getState().projEditor;

  if (
    oldSelectedFile &&
    !BaseMethods.isNull(oldSelectedFile) &&
    oldSelectedFile.file_id !== newSelectedFile.file_id
  ) {
    const legacySubDoc: Y.Doc | undefined = subDocs.get(
      oldSelectedFile.file_id
    );
    if (legacySubDoc) {
      clearLegacyFile(oldSelectedFile, rootYDoc, editorView);
    } else {
      clearLegacyEditor(oldSelectedFile, rootYDoc, editorView);
    }
  }

  let chooseSubDoc: Y.Doc | undefined = subDocs.get(newSelectedFile.file_id);
  if (chooseSubDoc && !BaseMethods.isNull(chooseSubDoc)) {
    chooseSubDoc.load();
    forceSetCurSubDoc(chooseSubDoc);
    setCurRootYDoc(rootYDoc);
    return;
  }

  let subDocEden = new Y.Doc();
  subDocEden.guid = newSelectedFile.file_id;
  subDocEden.load();
  setCurRootYDoc(rootYDoc);
  forceSetCurSubDoc(subDocEden);
}

export function handleFileCreateConfirm(
  selectedFile: TexFileModel,
  createFileName: string,
  pid: string
) {
  if (!selectedFile) {
    toast.warning(i18n.t("tips_specify_file_create_location"));
    return;
  }
  const validated = validateFileName(createFileName, "tips_input_file_new_name");
  if (!validated.ok) {
    toast.warning(i18n.t(validated.messageKey));
    return;
  }
  let parentId =
    selectedFile.file_type === 0 ? selectedFile.file_id : selectedFile.parent;
  let params = {
    name: validated.name,
    project_id: pid,
    parent: parentId,
    file_type: TeXFileType.TEX,
  };
  addFile(params);
}

export function handleProjSearch(
  curTabName: string,
  setCurTabName: (value: string) => void
) {
  curTabName !== "search" ? setCurTabName("search") : setCurTabName("tree");
}

export function handleProjSymbol(
  curTabName: string,
  setCurTabName: (value: string) => void
) {
  curTabName !== "symbol" ? setCurTabName("symbol") : setCurTabName("tree");
}

export function handleFileAdd() {
  let modal = document.getElementById("createFileModal");
  if (modal) {
    var myModal = new bootstrap.Modal(modal);
    myModal.show();
  }
}

export const clearLegacyFile = (
  oldSelectedFile: TexFileModel,
  curRootYDoc: Y.Doc,
  editorView: EditorView | undefined
) => {
  curRootYDoc.getMap("texhubsubdoc").delete(oldSelectedFile.file_id);
  clearLegacyEditor(oldSelectedFile, curRootYDoc, editorView);
};

export const clearLegacyEditor = (
  selectedFile: TexFileModel,
  _curRootYDoc: Y.Doc,
  _editorView: EditorView | undefined
) => {
  // 切换文件时仅解绑编辑器，不可 dispatch 空内容：yCollab 仍绑定旧文件 Y.Text，会同步全文删除到服务端
  console.log("[file-switch] leaving file without clearing yjs content", {
    fileId: selectedFile.file_id,
    name: selectedFile.name,
  });
};
