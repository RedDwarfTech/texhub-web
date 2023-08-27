import { RefObject, useState } from "react";
import styles from './ProjectTree.module.css';
import { Button, Dropdown, MenuProps, Modal } from "antd";
import { addFile, chooseFile, delTreeItem, getFileList } from "@/service/file/FileService";
import { ResponseHandler } from "rdjs-wheel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import React from "react";
import * as bootstrap from 'bootstrap';

export type TreeProps = {
    projectId: string;
    divRef: RefObject<HTMLDivElement>
};

const ProjectTree: React.FC<TreeProps> = (props: TreeProps) => {

    const divRef = props.divRef;
    const [folderName, setFolderName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [texFileTree, setTexFileTree] = useState<TexFileModel[]>([]);
    const { fileTree } = useSelector((state: AppState) => state.file);
    const [mainFile, setMainFile] = useState<TexFileModel>();
    const { confirm } = Modal;
    const pid = props.projectId;

    React.useEffect(() => {
        if (fileTree && fileTree.length > 0) {
            setTexFileTree(fileTree);
            let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
            setMainFile(defaultFile[0]);
        }
    }, [fileTree]);

    const handleFileAdd = () => {
        setIsModalOpen(true);
    }

    const handleFolderAdd = () => {
        let modal = document.getElementById('exampleModal');
        if (modal) {
            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        }
    }

    const handleOk = () => {
        setIsModalOpen(false);
        let params = {
            name: "demo",
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

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const renderIcon = (item: TexFileModel) => {
        if(item.file_type === 1) {
            return (<i className="fa-regular fa-file"></i>);
        }
        if(item.file_type === 2){
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
                <div key={item.file_id} className={styles.fileItem} onClick={() => handleTreeItemClick(item)}>
                    {renderIcon(item)}
                    <div>{item.name}</div>
                    <div className={styles.actions}>
                        <Dropdown menu={{ items }}
                            onOpenChange={(visible) =>
                                visible && handleDropdownClick(item.file_id)
                            }
                            placement="bottomLeft"
                            arrow={{ pointAtCenter: true }}>
                            <Button className={styles.moreBtn} icon={<i className="fa-solid fa-ellipsis-vertical"></i>} />
                        </Dropdown>
                    </div>
                </div>
            );
        });
        return tagList;
    }

    const handleFileDelete = () => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            content: <div>删除后数据无法恢复，确定要删除？</div>,
            onOk() {
                let params = {
                    file_id: mainFile
                };
                delTreeItem(params).then((resp) => {
                    if (ResponseHandler.responseSuccess(resp)) {
                        getFileList(pid.toString());
                    }
                });
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <a target="_blank" rel="noopener noreferrer" onClick={handleFileDelete}>
                    删除
                </a>
            ),
        },
    ];

    const handleDropdownClick = (fileId: string) => {

    };

    const handleTreeItemClick = (fileItem: TexFileModel) => {
        let params = {
            file_id: fileItem.file_id
        };
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
            <Modal title="创建文件" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <input placeholder="名称"></input>
            </Modal>
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
        </div>
    );
}

export default ProjectTree;