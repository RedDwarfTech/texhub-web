import { RefObject, useState } from "react";
import styles from './ProjectTree.module.css';
import { addFile, chooseFile, delTreeItem, getFileList } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import React from "react";
import * as bootstrap from 'bootstrap';
import { toast } from "react-toastify";

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
    const [mainFile, setMainFile] = useState<TexFileModel>();
    const pid = props.projectId;
    const selected = localStorage.getItem("proj-select-file:" + pid);
    const [selectedFile, setSelectedFile] = useState<TexFileModel>(selected ? JSON.parse(selected) : null);
    const [delFile, setDelFile] = useState<TexFileModel>();

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

    const handleFolderAdd = () => {
        let modal = document.getElementById('exampleModal');
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        }
    }

    const handleOk = () => {
        let params = {
            name: createFileName,
            project_id: pid,
            parent: pid,
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
        if (item.file_type === 2) {
            return (
                <div className={styles.menuIcons}>
                    <i className="fa-solid fa-chevron-right"></i>
                    <i className="fa-regular fa-folder"></i>
                </div>
            );
        }
    }

    const renderDirectoryTree = () => {
        if (!texFileTree) {
            return (<div></div>);
        }
        const tagList: JSX.Element[] = [];
        texFileTree.forEach((item: TexFileModel) => {
            tagList.push(
                <div key={item.file_id}
                    className={(selectedFile && item.file_id == selectedFile.file_id) ? styles.fileItemSelected : styles.fileItem} >
                    {renderIcon(item)}
                    <div>{item.name}</div>
                    <div className={styles.actions}>
                        <div className="dropdown">
                            <button className="btn text-white" type="button" id={"dropdownMenuButton1" + item.id} data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <ul className="dropdown-menu" aria-labelledby={"dropdownMenuButton1" + item.id}>
                                <li><a className="dropdown-item" onClick={() =>{showDeleteConfirm(true)}}>删除</a></li>
                                <li><a className="dropdown-item" onClick={() => {handleFileRename}}>重命名</a></li>
                                <li><a className="dropdown-item" href="#">下载文件</a></li>
                                <li><a className="dropdown-item" href="#">移动到文件夹</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        });
        return tagList;
    }

    const showDeleteConfirm = (show: boolean) => {
        let modal = document.getElementById('deleteFileModal');
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            if (show) {
                myModal.show();
            } else {

            }
        }
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
                showDeleteConfirm(false);
                getFileList(pid.toString());
            }
        });
    };

    const handleFileRename = () => {
        let modal = document.getElementById('renameFileModal');
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        }
    };

   

    const handleDropdownClick = (file: TexFileModel) => {
        setDelFile(file);
    };

    const handleTreeItemClick = (fileItem: TexFileModel) => {
        let params = {
            file_id: fileItem.file_id
        };
        localStorage.setItem("proj-select-file:" + pid, JSON.stringify(fileItem));
        setSelectedFile(fileItem);
        chooseFile(params);
    };

    const handleFolderAddConfirm = () => {
        if (!folderName || folderName.length === 0) {
            return;
        }
        let params = {
            name: folderName,
            project_id: pid,
            parent: pid,
            file_type: 2
        };
        addFile(params).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getFileList(pid?.toString());
            }
        });
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
                <button className={styles.menuButton} onClick={() => { handleFolderAdd() }}>
                    <i className="fa-solid fa-folder-plus"></i>
                </button>
            </div>
            <div className={styles.treeBody}>
                {renderDirectoryTree()}
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
                            <button type="button" className="btn btn-primary" onClick={() => { handleOk() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">创建文件夹</h5>
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
                            <button type="button" className="btn btn-primary" onClick={() => { handleFolderAddConfirm() }}>确定</button>
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
                            <button type="button" className="btn btn-primary" onClick={() => { handleFolderAddConfirm() }}>确定</button>
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
                            <button type="button" className="btn btn-primary" onClick={() => { handleFileDelete() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectTree;