import TexFileUtil from "@/common/TexFileUtil";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TreeFileType } from "@/model/file/TreeFileType";
import { handleFileSelected } from "./ProjectTreeHandler";
import { BaseMethods } from "rdjs-wheel";
import { setCurFileTree } from "@/service/file/FileService";
import * as Y from "rdyjs";
import { EditorView } from "@codemirror/view";

export const ProjectTreeFolder = {
  getExpandStatus: (item: TexFileModel): boolean => {
    let cachedStatus = localStorage.getItem("projTree:" + item.project_id);
    if (!cachedStatus) return false;
    let cachedItems: TexFileModel[] = JSON.parse(cachedStatus);
    const result = TexFileUtil.searchTreeSingleNode(cachedItems, item.file_id);
    return result;
  },
  mergeTreeExpand: (newTree: TexFileModel[], cacheTree: TexFileModel[]) => {
    newTree.forEach((newNode) => {
      let expandStatus = TexFileUtil.searchTreeSingleNode(
        cacheTree,
        newNode.file_id
      );
      if (expandStatus) {
        newNode.expand = expandStatus;
      }
      if (newNode.children && newNode.children.length > 0) {
        ProjectTreeFolder.mergeTreeExpand(newNode.children, cacheTree);
      }
    });
  },
  handleAutoExpandFolder: (
    item: TexFileModel,
    treeNode: TexFileModel[],
    expandFolder?: boolean
  ): TexFileModel[] => {
    if (!treeNode || treeNode.length === 0) return [];
    const updatedItems = ProjectTreeFolder.handleExpandClick(
      item.file_id,
      treeNode,
      expandFolder
    );
    localStorage.setItem(
      "projTree:" + item.project_id,
      JSON.stringify(updatedItems)
    );
    return updatedItems;
  },
  handleExpandClick: (
    itemId: string,
    itemList: TexFileModel[],
    expandFolder?: boolean
  ) => {
    if (BaseMethods.isNull(itemList)) return [];
    const updatedItems: TexFileModel[] = itemList.map((item) => {
      let expand;
      if (expandFolder) {
        expand = expandFolder;
      } else {
        expand = item.expand ? !item.expand : true;
      }
      if (item.file_id === itemId) {
        return {
          ...item,
          expand: expand,
        };
      } else if (item.children) {
        return {
          ...item,
          children: ProjectTreeFolder.handleExpandClick(
            itemId,
            item.children,
            expandFolder
          ),
        };
      } else {
        return item;
      }
    });
    return updatedItems;
  },
  collapseRecursive: (
    fullTree: TexFileModel[],
    treeNodes: TexFileModel[]
  ): TexFileModel[] => {
    let tempTree = fullTree;
    for (let i = 0; i < treeNodes.length; i++) {
      if (
        treeNodes[i].file_type === TreeFileType.Folder &&
        treeNodes[i].expand &&
        treeNodes[i].expand === true
      ) {
        let newTree = ProjectTreeFolder.handleAutoExpandFolder(
          treeNodes[i],
          tempTree,
          false
        );
        if (newTree) {
          /**
           * make the collapse works with the same levels if directory
           */
          tempTree = newTree;
        }
        if (
          newTree &&
          treeNodes[i].children &&
          treeNodes[i].children.length > 0
        ) {
          tempTree = ProjectTreeFolder.collapseRecursive(
            newTree,
            treeNodes[i].children
          );
        }
      }
    }
    return tempTree;
  },
  handleCollapseAll: (projectId: string): TexFileModel[] => {
    let legacyTree = localStorage.getItem("projTree:" + projectId);
    if (legacyTree == null) {
      return [];
    }
    let treeNodes: TexFileModel[] = JSON.parse(legacyTree);
    return ProjectTreeFolder.collapseRecursive(treeNodes, treeNodes);
  },
  handleExpandFolder: (
    name_paths: string[],
    projId: string,
    selectedFile: TexFileModel,
    ydoc: Y.Doc,
    editorView: EditorView | undefined
  ) => {
    for (let i = 0; i < name_paths.length; i++) {
      // get the newest tree content to avoid the legacy override the newest update
      let legacyTree = localStorage.getItem("projTree:" + projId);
      if (legacyTree == null) {
        return;
      }
      let treeNode: TexFileModel[] = JSON.parse(legacyTree);
      let end_idx = i + 1 === name_paths.length ? i : i + 1;
      let fPath = name_paths.slice(0, end_idx).join("/");
      let pathNode = TexFileUtil.searchTreeNodeByName(
        treeNode,
        name_paths[i],
        fPath
      );
      if (!pathNode) {
        continue;
      }
      if (pathNode.file_type === TreeFileType.Folder) {
        let upatedItems = ProjectTreeFolder.handleAutoExpandFolder(
          pathNode,
          treeNode,
          true
        );
        setCurFileTree(upatedItems);
      } else {
        handleFileSelected(pathNode, selectedFile, ydoc, editorView);
      }
    }
  },
  getNamePaths: (projId: string, fileId: string): string[] => {
    let legacyTree = localStorage.getItem("projTree:" + projId);
    if (legacyTree == null) {
      // get from server
      return [];
    }
    let cachedItems: TexFileModel[] = JSON.parse(legacyTree);
    const result: TexFileModel | null = TexFileUtil.searchTreeAndReturnNode(
      cachedItems,
      fileId
    );
    if (BaseMethods.isNull(result)) {
      return [];
    }
    let namePaths = result!.file_path.split("/").filter(Boolean);
    namePaths.push(result!.name);
    return namePaths;
  },
};
