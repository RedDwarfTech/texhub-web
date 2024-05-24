import { useState } from "react";
import styles from "./ProjectTree.module.css";
import { addFile, chooseFile, getFileTree } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import React from "react";
import * as bootstrap from "bootstrap";
import { toast } from "react-toastify";
import TreeUpload from "../upload/TreeUpload";
import TreeFileMove from "../move/TreeFileMove";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import ProjFileSearch from "../search/ProjFileSearch";
import TeXSymbol from "../symbol/TeXSymbol";
import TreeFileRename from "../rename/TreeFileRename";
import TreeFileDel from "../del/TreeFileDel";
import { TreeProps } from "@/model/props/TreeProps";
import { ProjectTreeFolder } from "./ProjectTreeFolder";
import {
  handleExpandFolderEvent,
  handleFileAdd,
  handleFileCreate,
  handleFileSelected,
  handleFileTreeUpdate,
  handleProjSearch,
  handleProjSymbol,
  resizeLeft,
} from "./ProjectTreeHandler";
import { TeXFileType } from "@/model/enum/TeXFileType";

const ProjectTree: React.FC<TreeProps> = (props: TreeProps) => {
  const divRef = props.divRef;
  const [folderName, setFolderName] = useState("");
  const [curTabName, setCurTabName] = useState("tree");
  const [createFileName, setCreateFileName] = useState("");
  const [texFileTree, setTexFileTree] = useState<TexFileModel[]>([]);
  const { fileTree, selectItem } = useSelector((state: AppState) => state.file);
  const { projInfo, srcFocus } = useSelector((state: AppState) => state.proj);
  const [mainFile, setMainFile] = useState<TexFileModel>();
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

  React.useEffect(() => {
    if (selectItem) {
      localStorage.setItem(
        "proj-select-file:" + props.projectId,
        JSON.stringify(selectItem)
      );
      setSelectedFile(selectItem);
    }
  }, [selectItem, props.projectId]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      handleFileTreeUpdate(projInfo.tree, props.projectId, setTexFileTree);
      setMainFile(projInfo.main_file);
      resizeLeft(props, "leftDraggable");
    }
  }, [projInfo, props.projectId, props]);

  React.useEffect(() => {
    if (fileTree && fileTree.length > 0) {
      handleFileTreeUpdate(fileTree, props.projectId, setTexFileTree);
      let defaultFile = fileTree.filter(
        (file: TexFileModel) => file.main_flag === 1
      );
      setMainFile(defaultFile[0]);
    }
  }, [fileTree, props.projectId]);

  const handleHeaderAction = (id: string) => {
    let modal = document.getElementById(id);
    if (modal) {
      var myModal = new bootstrap.Modal(modal);
      myModal.show();
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
            className="fa-solid fa-chevron-right"
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
    ProjectTreeFolder.handleExpandFolder(
      paths,
      props,
      selectedFile
    );
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
      let marginText = level === 0 ? "6px" : "20px";
      tagList.push(
        <div
          id={item.file_id}
          key={item.file_id}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDrop={(e) => handleDrop(e, item)}
          onDragLeave={(e) => handleDragLeave(e, item)}
          style={{ marginLeft: marginText }}
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
                      删除
                    </div>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={(e) => {
                        handleModal(e, true, "renameFileModal", item);
                      }}
                    >
                      重命名
                    </div>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={(e) => {
                        handleModal(e, true, "downloadFileModal", item);
                      }}
                    >
                      下载文件
                    </div>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={(e) => {
                        handleModal(e, true, "moveFileModal", item);
                      }}
                    >
                      移动到文件夹(Beta)
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
    handleFileSelected(fileItem, selectedFile);
  };

  const handleFolderAddConfirm = () => {
    if (!folderName || folderName.length === 0) {
      toast.warn("请输入文件夹名称");
      return;
    }
    let parentId = getParentId();
    if (!parentId || parentId.length === 0) {
      return;
    }
    let params = {
      name: folderName,
      project_id: pid,
      parent: parentId,
      file_type: 0,
    };
    addFile(params).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        getFileTree(pid?.toString());
      } else {
        toast.error(resp.msg);
      }
    });
  };

  const getParentId = (): string => {
    if (!selectedFile) {
      toast.warn("请选择目录位置");
      return "";
    }
    if (selectedFile.file_type === 0) {
      return selectedFile.file_id;
    } else {
      return selectedFile.parent;
    }
  };

  const handleInputChange = (event: any) => {
    setFolderName(event.target.value);
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
        props,
        selectedFile
      );
    }
  }, [srcFocus, props, selectedFile]);

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
            title="搜索"
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
                  handleFileCreate(selectedFile, createFileName, pid);
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="createFolderModal"
        aria-labelledby="createFolderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createFolderModalLabel">
                创建文件夹
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
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="文件夹名称"
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
                  handleFolderAddConfirm();
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
      <TreeUpload projectId={pid}></TreeUpload>
      <TreeFileMove projectId={pid} texFile={moveFile!}></TreeFileMove>
      <TreeFileRename projectId={pid} operFile={operFile!}></TreeFileRename>
      <TreeFileDel projectId={pid} operFile={operFile!}></TreeFileDel>
    </div>
  );
};

export default ProjectTree;
