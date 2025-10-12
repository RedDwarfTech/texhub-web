import { TexFileModel } from "@/model/file/TexFileModel";
import { addFile, chooseFile, switchFile } from "@/service/file/FileService";
import { ProjectTreeFolder } from "./ProjectTreeFolder";
import { toast } from "react-toastify";
import { TeXFileType } from "@/model/enum/TeXFileType";
import { BaseMethods } from "rdjs-wheel";
import * as bootstrap from "bootstrap";
import * as Y from "rdyjs";
import { EditorView } from "@codemirror/view";
import {
  setCurRootYDoc,
  setCurSubDoc,
} from "@/service/project/editor/EditorService";
import { isEnableSubDoc } from "@/common/EnvUtil.js";
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

export function handleFileSelected(
  newSelectedFile: TexFileModel,
  oldSelectedFile: TexFileModel | null,
  curRootYDoc: Y.Doc
) {
  if (oldSelectedFile && newSelectedFile.file_id === oldSelectedFile.file_id)
    return;
  chooseFile(newSelectedFile);
  if (newSelectedFile.file_type !== TeXFileType.FOLDER) {
    switchFile(newSelectedFile);
    if (!isEnableSubDoc()) {
      return;
    }
    let subDocs: Y.Map<Y.Doc> = curRootYDoc.getMap("texhubsubdoc");
    if (oldSelectedFile && !BaseMethods.isNull(oldSelectedFile)) {
      // destroy the legacy select file
      let legacySubDoc: Y.Doc | undefined = subDocs.get(
        oldSelectedFile.file_id
      );
      if (legacySubDoc) {
        const { editorView } = store.getState().projEditor;
        clearLegacyFile(oldSelectedFile, curRootYDoc, editorView);
      } else {
        console.error("did not get the legacy subdoc", oldSelectedFile.file_id);
      }
    }
    let chooseSubDoc: Y.Doc | undefined = subDocs.get(newSelectedFile.file_id);
    if (chooseSubDoc && !BaseMethods.isNull(chooseSubDoc)) {
      console.log("Found existing subdoc:", chooseSubDoc.guid);
      const subDocText = chooseSubDoc.getText(chooseSubDoc.guid);
      chooseSubDoc.load();
      setCurSubDoc(chooseSubDoc);
      // @ts-ignore
      chooseSubDoc.on("synced", () => {
        console.log("chooseSubDoc subdoc synced:" + chooseSubDoc.guid);
        const text = subDocText.toString();
        console.log("subdoc content:", text);
        setCurSubDoc(chooseSubDoc);
      });

      // Add connection status listener
      // @ts-ignore
      chooseSubDoc.on("connectionStatus", (status: any) => {
        console.log("SubDoc connection status:", status);
      });
      const { editorView } = store.getState().projEditor;
      subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
        console.log("doc receive update,id:" + chooseSubDoc!.guid);
        // updateEditor(tr, event, chooseSubDoc, editorView!);
      });
      setCurRootYDoc(curRootYDoc);
      return;
    }
    let subDocEden = new Y.Doc();
    subDocEden.guid = newSelectedFile.file_id;
    const subDocText = subDocEden.getText(subDocEden.guid);
    const { editorView } = store.getState().projEditor;
    subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
      console.log("doc(new) receive update,id:" + subDocEden.guid);
      //updateEditor(tr, event, subDocEden, editorView!);
    });
    // subDocEden.load();
    setCurRootYDoc(curRootYDoc);
    console.log("handleFileSelected: create new subdoc:", subDocEden.guid);
    setCurSubDoc(subDocEden);
  }
}

export function handleFileCreateConfirm(
  selectedFile: TexFileModel,
  createFileName: string,
  pid: string
) {
  if (!selectedFile) {
    toast.warning("请指定文件创建的位置");
    return;
  }
  let parentId =
    selectedFile.file_type === 0 ? selectedFile.file_id : selectedFile.parent;
  let params = {
    name: createFileName,
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
  curRootYDoc: Y.Doc,
  editorView: EditorView | undefined
) => {
  console.warn("destroy the legacy file", selectedFile);
  // curRootYDoc.getMap("texhubsubdoc").delete(selectedFile.file_id);
  // clear the legacy codemirror editor
  if (editorView) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: "",
      },
    });
  }
};
