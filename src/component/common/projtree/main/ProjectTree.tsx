import { useState } from "react";
import styles from "./ProjectTree.module.css";
import { downloadProjFile } from "@/service/file/FileService";
import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import React from "react";
import * as bootstrap from "bootstrap";
import TreeUpload from "../upload/TreeUpload";
import TreeFileMove from "../move/TreeFileMove";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import ProjFileSearch from "../search/ProjFileSearch";
import TeXSymbol from "../symbol/TeXSymbol";
import TreeFileRename from "../rename/TreeFileRename";
import TreeFileDel from "../del/TreeFileDel";
import { TreeProps } from "@/model/props/TreeProps";
import { ProjectTreeFolder } from "./ProjectTreeFolder";
import TreeFolderCreate from "../create/TreeFolderCreate";
import {
  handleExpandFolderEvent,
  handleFileAdd,
  handleFileCreateConfirm,
  handleFileSelected,
  handleFileTreeUpdate,
  handleProjSearch,
  handleProjSymbol
} from "./ProjectTreeHandler";
import { TeXFileType } from "@/model/enum/TeXFileType";
import { DownloadFileReq } from "@/model/request/file/query/DownloadFileReq";
import { useTranslation } from "react-i18next";
import * as Y from "yjs";

const ProjectTree: React.FC<TreeProps> = (props: TreeProps) => {
  const divRef = props.treeDivRef;
  const [curTabName, setCurTabName] = useState("tree");
  const [createFileName, setCreateFileName] = useState("");
  const [curDoc, setCurDoc] = useState<Y.Doc>();
  const [texFileTree, setTexFileTree] = useState<TexFileModel[]>([]);
  const { fileTree, treeSelectItem, curFileTree } = useSelector(
    (state: AppState) => state.file
  );
  const { projInfo, srcFocus } = useSelector((state: AppState) => state.proj);
  const { curYDoc } = useSelector((state: AppState) => state.projEditor);
  
  const pid = props.projectId;
  const selected = localStorage.getItem("proj-select-file:" + pid);
  const [selectedFile, setSelectedFile] = useState<TexFileModel>(
    selected ? JSON.parse(selected) : null
  );
  const [operFile, setOperFile] = useState<TexFileModel>();
  const [moveFile, setMoveFile] = useState<TexFileModel>();
  const [draggedNode, setDraggedNode] = useState<TexFileModel | null>(null);
  const [draggedOverNode, setDraggedOverNode] = useState<TexFileModel | null>(
    null
  );
  const { t } = useTranslation();

  React.useEffect(() => {
    if (treeSelectItem) {
      localStorage.setItem(
        "proj-select-file:" + props.projectId,
        JSON.stringify(treeSelectItem)
      );
      setSelectedFile(treeSelectItem);
    }
  }, [treeSelectItem, props.projectId]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      handleFileTreeUpdate(projInfo.tree, props.projectId, setTexFileTree);
    }
  }, [projInfo]);

  React.useEffect(() => {
    if (curYDoc) {
      setCurDoc(curYDoc);
    }
  }, [curYDoc]);

  React.useEffect(() => {
    if (curFileTree && Object.keys(curFileTree).length > 0) {
      handleFileTreeUpdate(curFileTree, props.projectId, setTexFileTree);
    }
  }, [curFileTree]);

  React.useEffect(() => {
    if (fileTree && fileTree.length > 0) {
      handleFileTreeUpdate(fileTree, props.projectId, setTexFileTree);
    }
  }, [fileTree]);

  const handleHeaderAction = (id: string) => {
    let modal = document.getElementById(id);
    if (modal) {
      var myModal = new bootstrap.Modal(modal);
      myModal.show();
    }
  };

  const handleDownloadFile = async (file: TexFileModel) => {
    try {
      let req: DownloadFileReq = {
        file_id: file.file_id,
      };
      downloadProjFile(req).then((resp) => {
        const blob = new Blob([resp], { type: "application/oct-stream" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleModal = (
    e: React.MouseEvent<HTMLDivElement>,
    show: boolean,
    modalId: string,
    file: TexFileModel
  ) => {
    e.preventDefault();
    e.stopPropagation();
    let modal = document.getElementById(modalId);
    if (modal) {
      setMoveFile(file);
      var myModal = new bootstrap.Modal(modal);
      show ? myModal.show() : myModal.hide();
    }
  };

  const renderIcon = (item: TexFileModel) => {
    if (item.file_type === TeXFileType.TEX) {
      return <i className="fa-regular fa-file"></i>;
    }
    if (item.file_type === TeXFileType.FOLDER) {
      return (
        <div className={styles.menuIcons}>
          <i
            className={
              item.expand
                ? `fa-solid fa-chevron-down ${styles.expandFlag}`
                : `fa-solid fa-chevron-right ${styles.expandFlag}`
            }
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              handleExpandFolderEvent(e, item, texFileTree, setTexFileTree);
            }}
          ></i>
          <i className="fa-regular fa-folder"></i>
        </div>
      );
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    node: TexFileModel
  ) => {
    e.dataTransfer?.setData("text/plain", node.id.toString());
    setDraggedNode(node);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    node: TexFileModel
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverNode(node);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetNode: TexFileModel
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedNode) {
      console.log(`Move node ${draggedNode.id} to ${targetNode.id}`);
    }
    setDraggedNode(null);
    setDraggedOverNode(null);
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    targetNode: TexFileModel
  ) => {
    if (draggedOverNode && targetNode.file_id === draggedOverNode?.file_id) {
      setDraggedOverNode(null);
    }
  };

  const handleSearchComplete = (paths: string[]) => {
    ProjectTreeFolder.handleExpandFolder(paths, props.projectId, selectedFile, curDoc!);
  };

  const renderBody = () => {
    if (curTabName === "tree") {
      return renderDirectoryTree(texFileTree, 0);
    } else if (curTabName === "search") {
      return (
        <ProjFileSearch
          closeSearch={() => {
            setCurTabName("tree");
          }}
          searchComplete={handleSearchComplete}
          projectId={props.projectId}
        ></ProjFileSearch>
      );
    } else if (curTabName === "symbol") {
      return <TeXSymbol></TeXSymbol>;
    } else {
      return <div>not support</div>;
    }
  };

  const renderDirectoryTree = (fileTree: TexFileModel[], level: number) => {
    if (!fileTree) {
      return <div></div>;
    }
    const tagList: JSX.Element[] = [];
    const sortedData = fileTree.sort((a, b) => {
      if (a.file_type === 0 && b.file_type !== 0) {
        return -1;
      }
      if (a.file_type !== 0 && b.file_type === 0) {
        return 1;
      }
      return 0;
    });
    sortedData.forEach((item: TexFileModel) => {
      let expandStatus: boolean = ProjectTreeFolder.getExpandStatus(item);
      tagList.push(
        <div
          id={item.file_id}
          key={item.file_id}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDrop={(e) => handleDrop(e, item)}
          onDragLeave={(e) => handleDragLeave(e, item)}
        >
          <div
            key={item.file_id}
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              handleTreeItemClick(e, item)
            }
            className={
              (selectedFile && item.file_id === selectedFile.file_id) ||
              (draggedOverNode && draggedOverNode.file_id === item.file_id)
                ? styles.fileItemSelected
                : styles.fileItem
            }
            style={{ paddingLeft: `${level === 0 ? 10 : level * 20 + 10}px` }}
          >
            {renderIcon(item)}
            <div className={styles.fileName}>{item.name}</div>
            <div className={styles.actions}>
              <div className="dropdown">
                <button
                  className="btn text-white"
                  type="button"
                  id={"dropdownMenuButton1" + item.id}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    handleDropdownClick(e, item);
                  }}
                >
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby={"dropdownMenuButton1" + item.id}
                >
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        handleModal(e, true, "deleteFileModal", item);
                      }}
                    >
                      {t("btn_del")}
                    </div>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={(e) => {
                        handleModal(e, true, "renameFileModal", item);
                      }}
                    >
                      {t("btn_rename")}
                    </div>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={(e) => {
                        handleDownloadFile(item);
                      }}
                    >
                      {t("btn_download")}
                    </div>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={(e) => {
                        handleModal(e, true, "moveFileModal", item);
                      }}
                    >
                      {t("btn_move_to_folder")}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {item.children && item.children.length > 0 && expandStatus ? (
            renderDirectoryTree(item.children, level + 1)
          ) : (
            <div></div>
          )}
        </div>
      );
    });
    return tagList;
  };

  const handleDropdownClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    file: TexFileModel
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setOperFile(file);
  };

  const handleTreeItemClick = (
    e: React.MouseEvent<HTMLDivElement>,
    fileItem: TexFileModel
  ) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelected(fileItem, selectedFile, curDoc!);
  };

  const handleFileInputChange = (event: any) => {
    setCreateFileName(event.target.value);
  };

  React.useEffect(() => {
    // navigate from pdf to source
    if (srcFocus && srcFocus.length > 0) {
      let pos: SrcPosition = srcFocus[0];
      let name_paths = pos.file.split("/");
      ProjectTreeFolder.handleExpandFolder(
        name_paths,
        props.projectId,
        selectedFile,
        curDoc!
      );
    }
  }, [srcFocus, props.projectId]);

  return (
    <div id="projTree" ref={divRef} className={styles.projTree}>
      <div className={styles.treeMenus}>
        <div>
          <button
            className={styles.menuButton}
            title="新增文件"
            onClick={() => {
              handleFileAdd();
            }}
          >
            <i className="fa-solid fa-file-circle-plus"></i>
          </button>
          <button
            className={styles.menuButton}
            title="创建文件夹"
            onClick={() => {
              handleHeaderAction("createFolderModal");
            }}
          >
            <i className="fa-solid fa-folder-plus"></i>
          </button>
          <button
            className={styles.menuButton}
            title="上传文件"
            onClick={() => {
              handleHeaderAction("uploadFileModal");
            }}
          >
            <i className="fa-solid fa-upload"></i>
          </button>
        </div>
        <div>
          <button
            className={styles.menuButton}
            title="折叠"
            onClick={() => {
              let newTree = ProjectTreeFolder.handleCollapseAll(
                props.projectId
              );
              setTexFileTree(newTree);
            }}
          >
            <i className="fa-solid fa-minus"></i>
          </button>
          <button
            className={styles.menuButton}
            title="常用符号"
            onClick={() => {
              handleProjSymbol(curTabName, setCurTabName);
            }}
          >
            <i className="fa-solid fa-infinity"></i>
          </button>
          <button
            className={styles.menuButton}
            title={t("btn_search")}
            onClick={() => {
              handleProjSearch(curTabName, setCurTabName);
            }}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div className={styles.treeBody}>{renderBody()}</div>
      <div
        className="modal fade"
        id="createFileModal"
        aria-labelledby="createModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createModalLabel">
                创建文件
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="input-group flex-nowrap">
                <input
                  id="folderName"
                  type="text"
                  onChange={handleFileInputChange}
                  className="form-control"
                  placeholder="新名称"
                  aria-label="Username"
                  aria-describedby="addon-wrapping"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={() => {
                  handleFileCreateConfirm(selectedFile, createFileName, pid);
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
      <TreeFolderCreate
        projectId={pid}
        selectedFile={selectedFile}
      ></TreeFolderCreate>
      <TreeUpload projectId={pid}></TreeUpload>
      <TreeFileMove projectId={pid} texFile={moveFile!}></TreeFileMove>
      <TreeFileRename projectId={pid} operFile={operFile!}></TreeFileRename>
      <TreeFileDel projectId={pid} operFile={operFile!}></TreeFileDel>
    </div>
  );
};

export default ProjectTree;
