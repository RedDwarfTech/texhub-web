export const TexFileUtil = {
  searchNodeByFileId: <T extends { file_id: string; children?: T[] }>(
    node: T,
    fileId: string
  ): T | null => {
    if (node.file_id === fileId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const result = TexFileUtil.searchNodeByFileId(child, fileId);
        if (result) {
          return result;
        }
      }
    }
    return null;
  },
  searchNodeByFileName: <
    T extends { name: string; file_path: string; children?: T[] }
  >(
    node: T,
    fileName: string,
    filePath: string
  ): T | null => {
    if (
      node.name === fileName &&
      filePath.replace(/^\/+|\/+$/g, "") ===
        node.file_path.replace(/^\/+|\/+$/g, "")
    ) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const result = TexFileUtil.searchNodeByFileName(
          child,
          fileName,
          filePath
        );
        if (result) {
          return result;
        }
      }
    }
    return null;
  },
  searchTreeNodeByName: <
    T extends { file_path: string; name: string; children?: T[] }
  >(
    cachedItems: T[],
    fileName: string,
    filePath: string
  ): T | null => {
    for (const item of cachedItems) {
      let nodes: T | null = TexFileUtil.searchNodeByFileName(
        item,
        fileName,
        filePath
      );
      if (nodes != null) {
        return nodes;
      }
    }
    return null;
  },
  searchTreeSingleNode: <
    T extends { expand: boolean; file_id: string; children?: T[] }
  >(
    cachedItems: T[],
    fid: string
  ): boolean => {
    for (const item of cachedItems) {
      let nodes = TexFileUtil.searchNodeByFileId(item, fid);
      if (nodes != null) {
        return nodes.expand ? nodes.expand : false;
      }
    }
    return false;
  },
  searchTreeNode: <
    T extends { expand: boolean; file_id: string; children?: T[] }
  >(
    cachedItems: T[],
    fid: string
  ): boolean => {
    for (const item of cachedItems) {
      let nodes = TexFileUtil.searchNodeByFileId(item, fid);
      if (nodes != null) {
        return true;
      }
    }
    return false;
  },
  genTeXTableCode: (rows: number, columns: number) => {
    let latexCode = "\\begin{table}[]\n";
    latexCode += "\t\\centering\n";
    latexCode += "\t\\begin{tabular}{|" + "c|".repeat(columns) + "}\n";;
    latexCode += "\t\\hline\n";

    for (let i = 0; i < rows; i++) {
      latexCode += "\tRow " + (i + 1);
      for (let j = 1; j < columns; j++) {
        latexCode += " & Cell " + (i + 1) + "," + (j + 1);
      }
      latexCode += " \\\\ \n\t\\hline\n";
    }

    latexCode += "\t\\end{tabular}\n";
    latexCode += "\\end{table}";
    return latexCode;
  },
};

export default TexFileUtil;
