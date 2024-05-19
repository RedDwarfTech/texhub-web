import TexFileUtil from "@/common/TexFileUtil";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TreeFileType } from "@/model/file/TreeFileType";

export const ProjectTreeFunc = {
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
        ProjectTreeFunc.mergeTreeExpand(newNode.children, cacheTree);
      }
    });
  },
  handleAutoExpandFolder: (
    item: TexFileModel,
    treeNode: TexFileModel[],
    expandFolder?: boolean
  ): TexFileModel[] => {
    if (!treeNode || treeNode.length === 0) return [];
    const updatedItems = ProjectTreeFunc.handleExpandClick(
      item.file_id,
      treeNode,
      expandFolder
    );
    localStorage.setItem(
      "projTree:" + item.project_id,
      JSON.stringify(updatedItems)
    );
    // setTexFileTree(updatedItems);
    return updatedItems;
  },
  handleExpandClick: (
    itemId: string,
    itemList: TexFileModel[],
    expandFolder?: boolean
  ) => {
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
          children: ProjectTreeFunc.handleExpandClick(
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
        let newTree = ProjectTreeFunc.handleAutoExpandFolder(
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
          tempTree = ProjectTreeFunc.collapseRecursive(
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
    return ProjectTreeFunc.collapseRecursive(treeNodes, treeNodes);
  },
};
