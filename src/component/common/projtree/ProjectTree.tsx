import { RefObject, useState } from "react";
import styles from './ProjectTree.module.css';
import { addFile, chooseFile, delTreeItem, getFileList, renameFileImpl, switchFile } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import React from "react";
import * as bootstrap from 'bootstrap';
import { toast } from "react-toastify";
import TreeUpload from "./upload/TreeUpload";
import TreeFileEdit from "./edit/TreeFileEdit";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import TexFileUtil from "@/common/TexFileUtil";
import { TreeFileType } from "@/model/file/TreeFileType";
import { RenameFile } from "@/model/request/file/edit/RenameFile";

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
    const { projInfo, srcFocus } = useSelector((state: AppState) => state.proj);
    const [mainFile, setMainFile] = useState<TexFileModel>();
    const pid = props.projectId;
    const selected = localStorage.getItem("proj-select-file:" + pid);
    const [selectedFile, setSelectedFile] = useState<TexFileModel>(selected ? JSON.parse(selected) : null);
    const [operFile, setOperFile] = useState<TexFileModel>();
    const [renameFile, setRenameFile] = useState<TexFileModel>();
    const [draggedNode, setDraggedNode] = useState<TexFileModel | null>(null);
    const [draggedOverNode, setDraggedOverNode] = useState<TexFileModel | null>(null);

    React.useEffect(() => {
        if (projInfo && Object.keys(projInfo).length > 0) {
            handleFileTreeUpdate(projInfo.tree);
            setMainFile(projInfo.main_file);
        }
    }, [projInfo]);

    React.useEffect(() => {
        if (srcFocus && srcFocus.length > 0) {
            let pos: SrcPosition = srcFocus[0];
            let name_paths = pos.file.split("/");
            handleExpandFolderCallback(name_paths);
        }
    }, [srcFocus]);

    React.useEffect(() => {
        if (fileTree && fileTree.length > 0) {
            handleFileTreeUpdate(fileTree);
            let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
            setMainFile(defaultFile[0]);
        }
    }, [fileTree]);

    const handleExpandFolderCallback = (name_paths: string[]) => {
        for (let i = 0; i < name_paths.length; i++) {
            // get the newest tree content to avoid the legacy override the newest update
            let legacyTree = localStorage.getItem('projTree');
            if (legacyTree == null) {
                return;
            }
            let treeNode: TexFileModel[] = JSON.parse(legacyTree);
            let end_idx = (i + 1) == name_paths.length ? i : i + 1;
            let fPath = name_paths.slice(0, end_idx).join('/');
            let pathNode = TexFileUtil.searchTreeNodeByName(treeNode, name_paths[i], fPath);
            if (!pathNode) {
                continue;
            }
            if (pathNode.file_type == TreeFileType.Folder) {
                handleAutoExpandFolder(pathNode, treeNode);
            } else {
                handleFileSelected(pathNode);
            }
        }
    }

    const handleFileAdd = () => {
        let modal = document.getElementById('createFileModal');
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        }
    }

    const handleFileTreeUpdate = (tree: TexFileModel[]) => {
        let legacyTree = localStorage.getItem('projTree');
        if (legacyTree) {
            // do the tree expand field merge
            let cacheTree = JSON.parse(legacyTree);
            mergeTreeExpand(tree, cacheTree);
            setTexFileTree(tree);
        } else {
            setTexFileTree(tree);
        }
    }

    const mergeTreeExpand = (newTree: TexFileModel[], cacheTree: TexFileModel[]) => {
        newTree.forEach(newNode => {
            let expandStatus = TexFileUtil.searchTreeSingleNode(cacheTree, newNode.file_id);
            if (expandStatus) {
                newNode.expand = expandStatus;
            }
            if (newNode.children && newNode.children.length > 0) {
                mergeTreeExpand(newNode.children, cacheTree);
            }
        });
    }

    const handleHeaderAction = (id: string) => {
        let modal = document.getElementById(id);
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        }
    }

    const handleModal = (e: React.MouseEvent<HTMLAnchorElement>, show: boolean, modalId: string, file: TexFileModel) => {
        e.preventDefault();
        e.stopPropagation();
        let modal = document.getElementById(modalId);
        if (modal) {
            setRenameFile(file);
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
                    <i className="fa-solid fa-chevron-right" onClick={(e: React.MouseEvent<HTMLElement>) => { handleExpandFolder(e, item) }}></i>
                    <i className="fa-regular fa-folder"></i>
                </div>
            );
        }
    }

    const handleExpandClick = (itemId: string, itemList: TexFileModel[], expandFolder?: boolean) => {
        const updatedItems: TexFileModel[] = itemList.map(item => {
            let expand;
            if (expandFolder) {
                expand = expandFolder;
            } else {
                expand = item.expand ? !item.expand : true
            }
            if (item.file_id === itemId) {
                return {
                    ...item,
                    expand: expand,
                };
            } else if (item.children) {
                return {
                    ...item,
                    children: handleExpandClick(itemId, item.children, expandFolder)
                };
            } else {
                return item;
            }
        });
        return updatedItems;
    };

    const handleAutoExpandFolder = (item: TexFileModel, treeNode: TexFileModel[]) => {
        if (!treeNode || treeNode.length === 0) return;
        const updatedItems = handleExpandClick(item.file_id, treeNode, true);
        localStorage.setItem("projTree", JSON.stringify(updatedItems));
        setTexFileTree(updatedItems);
    }

    const handleExpandFolder = (e: React.MouseEvent<HTMLElement>, item: TexFileModel) => {
        e.preventDefault();
        e.stopPropagation();
        if (!texFileTree || texFileTree.length === 0) return;
        const updatedItems = handleExpandClick(item.file_id, texFileTree);
        localStorage.setItem("projTree", JSON.stringify(updatedItems));
        setTexFileTree(updatedItems);
    }

    const getExpandStatus = (item: TexFileModel): boolean => {
        let cachedStatus = localStorage.getItem("projTree");
        if (!cachedStatus) return false;
        let cachedItems: TexFileModel[] = JSON.parse(cachedStatus);
        const result = TexFileUtil.searchTreeSingleNode(cachedItems, item.file_id);
        return result;
    }

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, node: TexFileModel) => {
        e.dataTransfer?.setData('text/plain', node.id.toString());
        setDraggedNode(node);
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, node: TexFileModel) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggedOverNode(node);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetNode: TexFileModel) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedNode) {
            // 这里可以根据业务逻辑处理节点的位置或层级关系
            console.log(`Move node ${draggedNode.id} to ${targetNode.id}`);
        }
        setDraggedNode(null);
        setDraggedOverNode(null);
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, targetNode: TexFileModel) => {
        if (draggedOverNode && targetNode.file_id == draggedOverNode?.file_id) {
            setDraggedOverNode(null);
        }
    };

    const renderDirectoryTree = (fileTree: TexFileModel[], level: number) => {
        if (!fileTree) {
            return (<div></div>);
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
            let expandStatus: boolean = getExpandStatus(item);
            let marginText = (level === 0) ? "6px" : "20px";
            tagList.push(
                <div id={item.file_id}
                    key={item.file_id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => handleDragOver(e, item)}
                    onDrop={(e) => handleDrop(e, item)}
                    onDragLeave={(e) => handleDragLeave(e, item)}
                    style={{ marginLeft: marginText }} >
                    <div key={item.file_id}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => handleTreeItemClick(e, item)}
                        className={(selectedFile && item.file_id == selectedFile.file_id) || (draggedOverNode && draggedOverNode.file_id == item.file_id) ? styles.fileItemSelected : styles.fileItem} >
                        {renderIcon(item)}
                        <div className={styles.fileName}>{item.name}</div>
                        <div className={styles.actions}>
                            <div className="dropdown">
                                <button className="btn text-white"
                                    type="button"
                                    id={"dropdownMenuButton1" + item.id}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { handleDropdownClick(e, item) }}>
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                                <ul className="dropdown-menu" aria-labelledby={"dropdownMenuButton1" + item.id}>
                                    <li><a className="dropdown-item" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { handleModal(e, true, "deleteFileModal", item) }}>删除</a></li>
                                    <li><a className="dropdown-item" onClick={(e) => { handleModal(e, true, "renameFileModal", item) }}>重命名</a></li>
                                    <li><a className="dropdown-item" onClick={(e) => { handleModal(e, true, "downloadFileModal", item) }}>下载文件</a></li>
                                    {
                                        /**<li><a className="dropdown-item" onClick={(e) => { handleModal(e, true, "moveFileModal", item) }}>移动到文件夹</a></li>**/
                                    }
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
        if (!operFile) {
            toast.error("请先选择要删除的文件");
            return;
        }
        let params = {
            file_id: operFile?.file_id
        };
        delTreeItem(params).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getFileList(pid.toString());
            }
        });
    };

    const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement>, file: TexFileModel) => {
        e.preventDefault();
        e.stopPropagation();
        setOperFile(file);
    };

    const handleTreeItemClick = (e: React.MouseEvent<HTMLDivElement>, fileItem: TexFileModel) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileSelected(fileItem);
    };

    const handleFileSelected = (fileItem: TexFileModel) => {
        localStorage.setItem("proj-select-file:" + pid, JSON.stringify(fileItem));
        setSelectedFile(fileItem);
        if (selectedFile && fileItem.file_id === selectedFile.file_id) return;
        chooseFile(fileItem);
        if (fileItem.file_type !== 0) {
            switchFile(fileItem);
        }
    }

    const handleRenameFile = () => {
        if (!renameFile || renameFile.name.length === 0 || !operFile) {
            toast.warn("请输入文件新名称");
            return;
        }
        let req: RenameFile = {
            file_id: renameFile.file_id,
            name: renameFile.name,
            legacy_name: operFile.name
        };
        renameFileImpl(req).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getFileList(pid?.toString());
            }
        });
    }

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

    const handleRenameFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!renameFile) {
            return;
        }
        let newFile: TexFileModel = {
            ...renameFile,
            name: event.target.value
        };
        setRenameFile(newFile);
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
                                    onChange={handleRenameFileChange}
                                    className="form-control"
                                    placeholder="新名称"
                                    aria-label="Username"
                                    value={renameFile ? renameFile.name : ""}
                                    aria-describedby="addon-wrapping" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleRenameFile() }}>确定</button>
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
            <TreeFileEdit projectId={pid}></TreeFileEdit>
        </div>
    );
}

export default ProjectTree;