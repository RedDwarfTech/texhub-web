import TexFileUtil from "@/common/TexFileUtil";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TreeFileType } from "@/model/file/TreeFileType";
import { handleFileSelected } from "./ProjectTreeHandler";
import { BaseMethods } from "rdjs-wheel";
import { setCurFileTree } from "@/service/file/FileService";
import * as Y from "yjs";

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
  /**
   * 按文件名在整棵树中查找节点（忽略路径）。
   * 用于 SyncTeX 只返回文件名（如 "skills.tex"）而文件位于子目录的场景。
   */
  findNodeByFileName: (
    tree: TexFileModel[],
    fileName: string
  ): TexFileModel | null => {
    for (const node of tree) {
      if (node.name === fileName) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = ProjectTreeFolder.findNodeByFileName(
          node.children,
          fileName
        );
        if (found) {
          return found;
        }
      }
    }
    return null;
  },
  /** 判断节点是否包含目标后代节点（不含自身） */
  hasChildNode: (node: TexFileModel, targetId: string): boolean => {
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.file_id === targetId) {
          return true;
        }
        if (ProjectTreeFolder.hasChildNode(child, targetId)) {
          return true;
        }
      }
    }
    return false;
  },
  /**
   * 展开到目标节点的所有祖先（目标节点自身不动），返回更新后的树。
   */
  expandAncestorsToNode: (
    tree: TexFileModel[],
    targetId: string
  ): TexFileModel[] => {
    const updated: TexFileModel[] = [];
    for (const node of tree) {
      if (ProjectTreeFolder.hasChildNode(node, targetId)) {
        updated.push({
          ...node,
          expand: true,
          children: ProjectTreeFolder.expandAncestorsToNode(
            node.children ?? [],
            targetId
          ),
        });
      } else {
        updated.push(node);
      }
    }
    return updated;
  },
  handleExpandFolder: (
    name_paths: string[],
    projId: string,
    selectedFile: TexFileModel,
    ydoc: Y.Doc
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
        // 按完整路径未匹配：SyncTeX 可能只返回文件名（如 "skills.tex"），
        // 而文件位于子目录（文件树 file_path 是父目录路径，不含文件名），
        // 此时按文件名在整棵树中查找，展开其祖先并打开文件。
        const targetFileName = name_paths[name_paths.length - 1];
        const found = ProjectTreeFolder.findNodeByFileName(
          treeNode,
          targetFileName
        );
        if (found) {
          const expandedTree = ProjectTreeFolder.expandAncestorsToNode(
            treeNode,
            found.file_id
          );
          localStorage.setItem(
            "projTree:" + projId,
            JSON.stringify(expandedTree)
          );
          setCurFileTree(expandedTree);
          handleFileSelected(found, selectedFile, ydoc);
        }
        return;
      }
      if (pathNode.file_type === TreeFileType.Folder) {
        let upatedItems = ProjectTreeFolder.handleAutoExpandFolder(
          pathNode,
          treeNode,
          true
        );
        setCurFileTree(upatedItems);
      } else {
        handleFileSelected(pathNode, selectedFile, ydoc);
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
