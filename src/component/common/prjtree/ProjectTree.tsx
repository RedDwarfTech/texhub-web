import { RefObject, useState } from "react";
import styles from './ProjectTree.module.css';
import { addFile, chooseFile, delTreeItem, getFileList, switchFile } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import React from "react";
import * as bootstrap from 'bootstrap';
import { toast } from "react-toastify";
import TreeUpload from "./upload/TreeUpload";

export type TreeProps = {
    projectId: string;
    divRef: RefObject<HTMLDivElement>
};

const ProjectTree: React.FC<TreeProps> = (props: TreeProps) => {

    const divRef = props.divRef;
    const [folderName, setFolderName] = useState('');
    const [createFileName, setCreateFileName] = useState('');
    const [texFileTree, setTexFileTree] = useState<TexFileModel[]>([]);
    const { fileTree } = useSelector((state: AppState) => state.file);
    const { projInfo } = useSelector((state: AppState) => state.proj);
    const [mainFile, setMainFile] = useState<TexFileModel>();
    const pid = props.projectId;
    const selected = localStorage.getItem("proj-select-file:" + pid);
    const [selectedFile, setSelectedFile] = useState<TexFileModel>(selected ? JSON.parse(selected) : null);
    const [delFile, setDelFile] = useState<TexFileModel>();

    React.useEffect(() => {
        if (projInfo && Object.keys(projInfo).length > 0) {
            setTexFileTree(projInfo.tree);
            setMainFile(projInfo.main_file);
        }
    }, [projInfo]);

    React.useEffect(() => {
        if (fileTree && fileTree.length > 0) {
            setTexFileTree(fileTree);
            let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
            setMainFile(defaultFile[0]);
        }
    }, [fileTree]);

    const handleFileAdd = () => {
        let modal = document.getElementById('createFileModal');
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        }
    }

    const handleHeaderAction = (id: string) => {
        let modal = document.getElementById(id);
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        }
    }

    const handleModal = (show: boolean, modalId: string) => {
        let modal = document.getElementById(modalId);
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            show ? myModal.show() : myModal.hide();
        }
    }

    const handleOk = () => {
        if (!selectedFile) {
            toast.warning("请指定文件创建的位置");
            return;
        }
        let parentId = (selectedFile.file_type === 0) ? selectedFile.file_id : selectedFile.parent;
        let params = {
            name: createFileName,
            project_id: pid,
            parent: parentId,
            file_type: 1
        };
        addFile(params).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getFileList(pid?.toString());
            }
        });
    };

    const renderIcon = (item: TexFileModel) => {
        if (item.file_type === 1) {
            return (<i className="fa-regular fa-file"></i>);
        }
        if (item.file_type === 0) {
            return (
                <div className={styles.menuIcons}>
                    <i className="fa-solid fa-chevron-right" onClick={() => { expandFolder(item) }}></i>
                    <i className="fa-regular fa-folder"></i>
                </div>
            );
        }
    }

    const handleExpandClick = (itemId: string, itemList: TexFileModel[]) => {
        const updatedItems: TexFileModel[] = itemList.map(item => {
            if (item.file_id === itemId) {
                return {
                    ...item,
                    expand: item.expand ? !item.expand : true,
                };
            } else if (item.children) {
                return {
                    ...item,
                    children: handleExpandClick(itemId, item.children)
                };
            } else {
                return item;
            }
        });
        return updatedItems;
    };

    const expandFolder = (item: TexFileModel) => {
        if (!texFileTree || texFileTree.length === 0) return;
        const updatedItems = handleExpandClick(item.file_id, texFileTree);
        localStorage.setItem("projTree", JSON.stringify(updatedItems));
        setTexFileTree(updatedItems);
    }

    const getExpandStatus = (item: TexFileModel): boolean => {
        let cachedStatus = localStorage.getItem("projTree");
        if (!cachedStatus) return false;
        let cachedItems: TexFileModel[] = JSON.parse(cachedStatus);
        const result = searchSingle(cachedItems, item.file_id);
        return result;
    }

    const searchNodeByFileId = (node: TexFileModel, fileId: string): TexFileModel | null => {
        if (node.file_id === fileId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            const result = searchNodeByFileId(child, fileId);
            if (result) {
              return result;
            }
          }
        }
        return null;
      }

    const searchSingle = (cachedItems: TexFileModel[],  fid: string) :boolean => {
        for (const item of cachedItems) {
            let nodes = searchNodeByFileId(item, fid);
            if(nodes != null){
                return nodes.expand?nodes.expand:false;
            }
        }
        return false;
    }

    const renderDirectoryTree = (fileTree: TexFileModel[], level: number) => {
        if (!fileTree) {
            return (<div></div>);
        }
        const tagList: JSX.Element[] = [];
        fileTree.forEach((item: TexFileModel) => {
            let expandStatus: boolean = getExpandStatus(item);
            console.log("filename: {},expand status: {}", item.name, expandStatus);
            let marginText = (level === 0) ? "6px" : "20px";
            tagList.push(
                <div id={item.file_id} key={item.file_id} style={{ marginLeft: marginText }} >
                    <div key={item.file_id}
                        onClick={() => handleTreeItemClick(item)}
                        className={(selectedFile && item.file_id == selectedFile.file_id) ? styles.fileItemSelected : styles.fileItem} >
                        {renderIcon(item)}
                        <div className={styles.fileName}>{item.name}</div>
                        <div className={styles.actions}>
                            <div className="dropdown">
                                <button className="btn text-white" type="button" id={"dropdownMenuButton1" + item.id} data-bs-toggle="dropdown" aria-expanded="false" onClick={() => { handleDropdownClick(item) }}>
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                                <ul className="dropdown-menu" aria-labelledby={"dropdownMenuButton1" + item.id}>
                                    <li><a className="dropdown-item" onClick={() => { handleModal(true, "deleteFileModal") }}>删除</a></li>
                                    <li><a className="dropdown-item" onClick={() => { handleModal(true, "renameFileModal") }}>重命名</a></li>
                                    <li><a className="dropdown-item" onClick={() => { handleModal(true, "downloadFileModal") }}>下载文件</a></li>
                                    <li><a className="dropdown-item" onClick={() => { handleModal(true, "moveFileModal") }}>移动到文件夹</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {(item.children && item.children.length > 0 && expandStatus) ? renderDirectoryTree(item.children, level + 1) : <div></div>}
                </div>
            );
        });
        return tagList;
    }

    const handleFileDelete = () => {
        if (!delFile) {
            toast.error("请先选择要删除的文件");
            return;
        }
        let params = {
            file_id: delFile?.file_id
        };
        delTreeItem(params).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getFileList(pid.toString());
            }
        });
    };

    const handleDropdownClick = (file: TexFileModel) => {
        setDelFile(file);
    };

    const handleTreeItemClick = (fileItem: TexFileModel) => {
        localStorage.setItem("proj-select-file:" + pid, JSON.stringify(fileItem));
        setSelectedFile(fileItem);
        if (selectedFile && fileItem.file_id === selectedFile.file_id) return;
        chooseFile(fileItem);
        if (fileItem.file_type !== 0) {
            switchFile(fileItem);
        }
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
            file_type: 0
        };
        addFile(params).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getFileList(pid?.toString());
            }
        });
    }

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
    }

    const handleInputChange = (event: any) => {
        setFolderName(event.target.value);
    };

    const handleFileInputChange = (event: any) => {
        setCreateFileName(event.target.value);
    };

    if (!mainFile) {
        return <div>Loading...</div>
    }

    return (
        <div id="prjTree" ref={divRef} className={styles.prjTree}>
            <div className={styles.treeMenus}>
                <button className={styles.menuButton} onClick={() => { handleFileAdd() }}>
                    <i className="fa-solid fa-file-circle-plus"></i>
                </button>
                <button className={styles.menuButton} onClick={() => { handleHeaderAction("createFolderModal") }}>
                    <i className="fa-solid fa-folder-plus"></i>
                </button>
                <button className={styles.menuButton} onClick={() => { handleHeaderAction("uploadFileModal") }}>
                    <i className="fa-solid fa-upload"></i>
                </button>
            </div>
            <div className={styles.treeBody}>
                {renderDirectoryTree(texFileTree, 0)}
            </div>
            <div className="modal fade" id="createFileModal" aria-labelledby="createModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="createModalLabel">创建文件</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group flex-nowrap">
                                <input id="folderName"
                                    type="text"
                                    onChange={handleFileInputChange}
                                    className="form-control"
                                    placeholder="新名称"
                                    aria-label="Username"
                                    aria-describedby="addon-wrapping" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleOk() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="createFolderModal" aria-labelledby="createFolderModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="createFolderModalLabel">创建文件夹</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group flex-nowrap">
                                <input id="folderName"
                                    type="text"
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="文件夹名称"
                                    aria-label="Username"
                                    aria-describedby="addon-wrapping" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleFolderAddConfirm() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="renameFileModal" aria-labelledby="renameModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="renameModalLabel">重命名</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group flex-nowrap">
                                <input id="folderName"
                                    type="text"
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="新名称"
                                    aria-label="Username"
                                    aria-describedby="addon-wrapping" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleFolderAddConfirm() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="deleteFileModal" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteModalLabel">删除文件</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group flex-nowrap">
                                删除后数据无法恢复，确定要删除文件吗？
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleFileDelete() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            <TreeUpload projectId={pid}></TreeUpload>
        </div>
    );
}

export default ProjectTree;