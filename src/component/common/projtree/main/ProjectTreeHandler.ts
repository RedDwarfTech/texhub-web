import { TexFileModel } from "@/model/file/TexFileModel";
import { addFile, chooseFile, switchFile } from "@/service/file/FileService";
import { ProjectTreeFolder } from "./ProjectTreeFolder";
import { toast } from "react-toastify";
import { TeXFileType } from "@/model/enum/TeXFileType";
import { ResponseHandler } from "rdjs-wheel";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { getProjectInfo } from "@/service/project/ProjectService";
import * as bootstrap from "bootstrap";
import * as Y from "rdyjs";
import { updateEditor } from "@/service/editor/CollarEditorSocketIOService";
import { EditorView } from "@codemirror/view";
import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider.js";

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
  fileItem: TexFileModel,
  selectedFile: TexFileModel,
  curYDoc: Y.Doc,
  editorView: EditorView | undefined,
  provider: SocketIOClientProvider
) {
  if (selectedFile && fileItem.file_id === selectedFile.file_id) return;
  chooseFile(fileItem);
  if (fileItem.file_type !== TeXFileType.FOLDER) {
    switchFile(fileItem);
    let subdoc = localStorage.getItem("subdoc");
    if (subdoc && subdoc === "subdoc") {
      // destroy the legacy select file
      let legacySubDoc: any = curYDoc.getMap().get(selectedFile.file_id);
      if (legacySubDoc) {
        console.warn("destroy the legacy file", selectedFile);
        // legacySubDoc.destroy();
      }
      let subDoc: any = curYDoc.getMap().get(fileItem.file_id.toString());
      if (subDoc) {
        subDoc.load();
      } else {
        let subDocEden = new Y.Doc();
        subDocEden.guid = fileItem.file_id;
        const subDocText = subDocEden.getText(subDocEden.guid);
        subDocEden.load();
        // @ts-ignore
        subDocEden.on("synced", () => {
          console.log("subDocEden synced");
          console.log(subDocText);
        });
        subDocText.observe((event: Y.YTextEvent, tr: Y.Transaction) => {
          updateEditor(editorView, tr, event, subDocEden);
        });
        console.info("newest docs:" + JSON.stringify(provider.docs));
        // @ts-ignore
        subDocEden.on('afterTransaction', function(tr, doc) {
          // 这里可以访问事务完成后的文档内容
          debugger;
          
          // 1. 检查事务中有哪些改变
          // @ts-ignore
          tr.changed.forEach((changeSet, sharedType) => {
            // sharedType是被修改的共享类型(如Y.Map, Y.Array, Y.Text等)
            
            if (sharedType instanceof Y.Map) {
              console.log('subDocEdenY.Map被修改：');
              // 遍历所有被修改的键
              // @ts-ignore
              changeSet.forEach((value, key) => {
                console.log(`  - subDocEden键 ${key} 被修改为:`, sharedType.get(key));
              });
            } 
            else if (sharedType instanceof Y.Array) {
              console.log('subDocEdenY.Array被修改：', sharedType.toArray());
            }
            else if (sharedType instanceof Y.Text) {
              console.log('subDocEdenY.Text被修改：', sharedType.toString());
            }
          });
          
          // 2. 获取指定共享类型的完整内容
          if (doc.getMap('texhubsubdoc')) {
            console.log('subDocEdenmyMap当前内容：', doc.getMap('texhubsubdoc').toJSON());
          }
        });
        curYDoc.getMap().set(fileItem.file_id.toString(), subDocEden);
        // curYDoc.subdocs.add(subDocEden);
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
