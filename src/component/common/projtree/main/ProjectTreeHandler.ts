import { TexFileModel } from "@/model/file/TexFileModel";
import { TreeProps } from "@/model/props/TreeProps";
import { addFile, chooseFile, switchFile } from "@/service/file/FileService";
import { ProjectTreeFolder } from "./ProjectTreeFolder";
import { toast } from "react-toastify";
import { TeXFileType } from "@/model/enum/TeXFileType";
import { ResponseHandler } from "rdjs-wheel";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { getProjectInfo } from "@/service/project/ProjectService";
import * as bootstrap from "bootstrap";

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
  console.warn("trigger expand")
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

/**
 * resize left should put to the app layer
 * @param resizeBarName
 * @param resizeArea
 */
export function resizeLeft(props: TreeProps, resizeBarName: string) {
  setTimeout(() => {
    let prevCursorOffset = -1;
    let resizing = false;
    const resizeElement: HTMLElement | null = props.treeDivRef.current;
    if (resizeElement == null || !resizeElement) {
      console.error("left resize element is null");
      return;
    }
    const resizeBar: HTMLElement | null =
      document.getElementById(resizeBarName);
    if (resizeBar == null) {
      console.error("resize bar is null");
      return;
    }
    resizeBar.addEventListener("mousedown", () => {
      resizing = true;
    });
    window.addEventListener("mousemove", handleResizeMenu);
    window.addEventListener("mouseup", () => {
      resizing = false;
    });
    function handleResizeMenu(e: MouseEvent) {
      const { screenX } = e;
      e.preventDefault();
      e.stopPropagation();
      if (!resizing) {
        return;
      }
      if (resizeElement == null) return;
      if (prevCursorOffset === -1) {
        prevCursorOffset = screenX;
      } else if (Math.abs(prevCursorOffset - screenX) >= 5) {
        resizeElement.style.flex = `0 0 ${screenX}px`;
        resizeElement.style.maxWidth = "100vw";
        prevCursorOffset = screenX;
      }
    }
  }, 1500);
}

export function handleFileSelected(
  fileItem: TexFileModel,
  selectedFile: TexFileModel,
) {
  if (selectedFile && fileItem.file_id === selectedFile.file_id) return;
  chooseFile(fileItem);
  if (fileItem.file_type !== TeXFileType.FOLDER) {
    switchFile(fileItem);
  }
}

export function handleFileCreate(
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
