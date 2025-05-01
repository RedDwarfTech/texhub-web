import { TexFileModel } from "@/model/file/TexFileModel";
import { addFile, chooseFile, switchFile } from "@/service/file/FileService";
import { ProjectTreeFolder } from "./ProjectTreeFolder";
import { toast } from "react-toastify";
import { TeXFileType } from "@/model/enum/TeXFileType";
import { BaseMethods, ResponseHandler } from "rdjs-wheel";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { getProjectInfo } from "@/service/project/ProjectService";
import * as bootstrap from "bootstrap";
import * as Y from "rdyjs";
import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider.js";
import { updateEditor } from "@/service/editor/CollarEditorSocketIOService";
import {
  setCurRootYDoc,
  setCurSubYDoc,
} from "@/service/project/editor/EditorService";

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
  curRootYDoc: Y.Doc,
  editorView: EditorView | undefined
) {
  if (oldSelectedFile && newSelectedFile.file_id === oldSelectedFile.file_id)
    return;
  chooseFile(newSelectedFile);
  if (newSelectedFile.file_type !== TeXFileType.FOLDER) {
    switchFile(newSelectedFile);
    let subdoc = localStorage.getItem("subdoc");
    if (subdoc && subdoc === "subdoc") {
      let subDocs: Y.Map<Y.Doc> = curRootYDoc.getMap("texhubsubdoc");
      if (oldSelectedFile) {
        // destroy the legacy select file
        let legacySubDoc: Y.Item | undefined = subDocs._map.get(
          oldSelectedFile.file_id.toString()
        );
        if (legacySubDoc) {
          legacyFileDestroy(oldSelectedFile, curRootYDoc, editorView);
        } else {
          console.error(
            "did not get the legacy subdoc",
            oldSelectedFile.file_id
          );
        }
      }
      let subDoc: any = subDocs._map.get(newSelectedFile.file_id.toString());
      if (subDoc && !BaseMethods.isNull(subDoc)) {
        setCurSubYDoc(subDoc);
        subDoc.load();
      } else {
        let subDocEden = new Y.Doc();
        subDocEden.guid = newSelectedFile.file_id;
        const subDocText = subDocEden.getText(subDocEden.guid);
        // subDocEden.load();
        subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
          updateEditor(editorView, tr, event, subDocEden);
        });
        setCurRootYDoc(curRootYDoc);
        setCurSubYDoc(subDocEden);
      }
    }
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
  addFile(params).then((resp) => {
    if (ResponseHandler.responseSuccess(resp)) {
      let req: QueryProjInfo = {
        project_id: pid?.toString(),
      };
      getProjectInfo(req);
    } else {
      toast.error(resp.msg);
    }
  });
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

export const legacyFileDestroy = (
  selectedFile: TexFileModel,
  curRootYDoc: Y.Doc,
  editorView: EditorView | undefined
) => {
  console.warn("destroy the legacy file", selectedFile);
  curRootYDoc.getMap("texhubsubdoc").delete(selectedFile.file_id);
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
