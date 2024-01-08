import TexHeader from "@/component/header/TexHeader";
import styles from "./ProjectTab.module.css";
import React, { ChangeEvent, useRef, useState } from "react";
import { copyProj, deleteProject, downloadProj, getFolderProject, getProjectList } from "@/service/project/ProjectService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { ResponseHandler } from "rdjs-wheel";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import TeXShare from "./share/TeXShare";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { useTranslation } from "react-i18next";
import TeXEdit from "./edit/TeXEdit";
import TeXArchive from "./archive/TeXArchive";
import TeXTrash from "./trash/TeXTrash";
import { ProjTabType } from "@/model/proj/config/ProjTabType";
import TeXRecovery from "./recovery/TeXRecovery";
import { QueryDownload } from "@/model/request/proj/query/QueryDownload";
import TeXBlank from "./new/TeXBlank";
import { TexProjectFolder } from "@/model/proj/TexProjectFolder";
import TeXNewFolder from "./new/TeXNewFolder";
import TeXMoveToFolder from "./edit/TeXMoveToFolder";
import FolderRename from "./edit/FolderRename";
import FolderDel from "./edit/FolderDel";
import { FolderModel } from "@/model/proj/folder/FolderModel";

const ProjectTab: React.FC = () => {

    const [userDocList, setUserDocList] = useState<TexProjectModel[]>([]);
    const [projMap, setProjMap] = useState<Map<number, FolderModel>>(new Map<number, FolderModel>());
    const [projFolders, setProjFolders] = useState<TexProjectFolder[]>([]);
    const [currProject, setCurrProject] = useState<TexProjectModel>();
    const [currFolder, setCurrFolder] = useState<TexProjectFolder>();
    const [projName, setProjName] = useState<string>('');
    const [activeTab, setActiveTab] = useState<ProjTabType>(ProjTabType.All);
    const { projList, folderProjList } = useSelector((state: AppState) => state.proj);
    const delProjCancelRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { i18n } = useTranslation();

    React.useEffect(() => {
        getProjectList(getProjFilter({}));
    }, []);

    React.useEffect(() => {
        if (folderProjList && folderProjList.length > 0) {
            if (currFolder) {
                // https://stackoverflow.com/questions/77779484/the-react-setstate-did-not-trigger-the-map-rerender
                setProjMap((prevMapState) => {
                    const newMapState = new Map<number, FolderModel>(prevMapState);
                    let cachedExpand = newMapState.get(currFolder.id)?.expand;
                    let folderModel: FolderModel = {
                        expand: cachedExpand ? cachedExpand : true,
                        projects: folderProjList
                    };
                    newMapState.set(currFolder.id, folderModel);
                    return newMapState;
                });
            }
        }
    }, [folderProjList]);

    React.useEffect(() => {
        setUserDocList(projList.projects);
        setProjFolders(projList.folders);
    }, [projList]);

    const handleProjDel = () => {
        if (!currProject) {
            toast.info("请选择删除项目");
        }
        let proj = {
            project_id: currProject?.project_id
        };
        deleteProject(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList(getProjFilter({}));
                if (delProjCancelRef && delProjCancelRef.current) {
                    delProjCancelRef.current.click();
                }
            } else {
                toast.error("删除项目失败，{}", resp.msg);
            }
        });
    }

    const handleProjDownload = (docItem: TexProjectModel) => {
        if (!currProject) {
            toast.info("请选择下载项目");
        }
        let proj: QueryDownload = {
            project_id: docItem.project_id,
            version: "1"
        };
        downloadProj(proj).then((resp) => {
            const blob = new Blob([resp], { type: 'application/zip' })
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = currProject?.proj_name + '.zip';
            link.click();
            window.URL.revokeObjectURL(url);
        });
    }

    const handleProjCopy = (docItem: TexProjectModel) => {
        if (!currProject) {
            toast.info("请选择复制的项目");
        }
        let proj: QueryDownload = {
            project_id: docItem.project_id,
            version: "1"
        };
        copyProj(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                toast.success("项目已复制");
            } else {
                toast.error("项目复制失败");
            }
        });
    }

    const getProjFilter = (query: QueryProjReq): QueryProjReq => {
        if (activeTab === ProjTabType.All) {
            return query;
        } else if (activeTab === ProjTabType.Shared) {
            query.role_id = 2;
            return query;
        } else if (activeTab === ProjTabType.Trash) {
            query.trash = 1;
        }
        query.proj_type = activeTab;
        return query;
    }

    const handleOperClick = (e: React.MouseEvent<HTMLButtonElement>, docItem: TexProjectModel) => {
        e.stopPropagation();
        setCurrProject(docItem);
    }

    const handleFolderOperClick = (e: React.MouseEvent<HTMLButtonElement>, docItem: TexProjectFolder) => {
        e.stopPropagation();
        setCurrFolder(docItem);
    }

    const renderFolderMenu = () => {
        return (
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButtonFolder">
                <li>
                    <a className="dropdown-item" data-bs-toggle="modal" data-bs-target="#delFolder">删除文件夹</a>
                </li>
                <li>
                    <a className="dropdown-item" data-bs-toggle="modal" data-bs-target="#renameFolder">重命名文件夹</a>
                </li>
            </ul>
        );
    }

    const renderMenu = (docItem: TexProjectModel) => {
        if (activeTab === ProjTabType.All) {
            return (
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li>
                        <a className="dropdown-item"
                            data-bs-toggle="modal"
                            onClick={() => { setCurrProject(docItem) }}
                            data-bs-target="#editPrj">修改项目名称</a>
                    </li>
                    <li>
                        <a className="dropdown-item"
                            data-bs-toggle="modal"
                            onClick={() => { setCurrProject(docItem) }}
                            data-bs-target="#sharePrj">分享项目</a>
                    </li>
                    <li>
                        <a className="dropdown-item"
                            data-bs-toggle="modal"
                            onClick={() => { setCurrProject(docItem) }}
                            data-bs-target="#archiveProj">归档项目
                        </a>
                    </li>
                    <li>
                        <a className="dropdown-item"
                            data-bs-toggle="modal"
                            onClick={() => { handleProjDownload(docItem) }}>下载项目
                        </a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal"
                            onClick={() => { handleProjCopy(docItem) }}>复制项目
                        </a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#moveProj">移动到文件夹</a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#trashProj">移动到回收站</a>
                    </li>
                </ul>);
        } else if (activeTab === ProjTabType.Shared) {
            return (
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#trashProj">移动到回收站</a>
                    </li>
                </ul>
            );
        } else if (activeTab === ProjTabType.Archived) {
            return (<ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                    <a className="dropdown-item"
                        data-bs-toggle="modal"
                        onClick={() => { setCurrProject(docItem) }}
                        data-bs-target="#trashProj">移动到回收站</a>
                </li>
                <li>
                    <a className="dropdown-item"
                        data-bs-toggle="modal"
                        onClick={() => { setCurrProject(docItem) }}
                        data-bs-target="#recoveryProj">恢复项目</a>
                </li>
            </ul>);
        } else if (activeTab === ProjTabType.Trash) {
            return (
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#recoveryProj">恢复项目</a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#delPrj">删除</a>
                    </li>
                </ul>
            );
        }
    }

    const handleProjNameClick = (docItem: TexProjectModel) => {
        if (activeTab === ProjTabType.Archived) {
            toast.info("项目已归档");
            return;
        }
        navigate("/editor?pid=" + docItem.project_id)
    }

    const renderFolderProj = (folderId: number): JSX.Element[] => {
        let curProjMap: FolderModel | undefined = projMap.get(folderId);
        if (!curProjMap || curProjMap.projects.length === 0) {
            return ([]);
        }
        if (!curProjMap.expand) {
            return ([]);
        }
        let projList = renderProj(curProjMap.projects);
        debugger
        return projList;
    }

    const getFolderProjects = (folder: TexProjectFolder) => {
        setCurrFolder(folder);
        let curProjMap: FolderModel | undefined = projMap.get(folder.id);
        if (curProjMap) {
            // expand or collapse the folder
            const updatedItems = new Map<number, FolderModel>(projMap);
            let new_map: FolderModel = {
                expand: !curProjMap.expand,
                projects: curProjMap.projects
            };
            updatedItems.set(folder.id, new_map);
            setProjMap(updatedItems);
        } else {
            getFolderProject(folder.id);
        }
    }

    const renderFolder = () => {
        if (!projFolders || projFolders.length === 0) {
            return (<div></div>);
        };
        const tagList: JSX.Element[] = [];
        projFolders.forEach((folderItem: TexProjectFolder) => {
            if (folderItem.default_folder !== 1) {
                const formattedTime = dayjs(folderItem.updated_time).format('YYYY-MM-DD HH:mm:ss');
                const projCreatedTime = dayjs(folderItem.created_time).format('YYYY-MM-DD HH:mm:ss');
                tagList.push(
                    <div key={folderItem.id} className="list-group-item">
                        <div className={styles.docHeader}>
                            <div className={styles.projTiltle}>
                                <i className="fa-solid fa-folder"></i>
                                <a onClick={() => { getFolderProjects(folderItem) }}>
                                    <h6>{folderItem.folder_name}</h6>
                                </a>
                            </div>
                            <div className={styles.option}>
                                <div className="dropdown">
                                    <button className="btn btn-secondary dropdown-toggle"
                                        type="button"
                                        id="dropdownMenuButtonFolder"
                                        data-bs-toggle="dropdown"
                                        onClick={(e) => { handleFolderOperClick(e, folderItem) }}
                                        aria-expanded="false">
                                        操作
                                    </button>
                                    {renderFolderMenu()}
                                </div>
                            </div>
                        </div>
                        <div className={styles.projAttr}>
                            <div><span>创建时间：</span>{projCreatedTime}</div>
                            <div><span>更新时间：</span>{formattedTime}</div>
                        </div>
                        <div>
                            {renderFolderProj(folderItem.id)}
                        </div>
                    </div>
                );
            }
        });
        return tagList;
    }

    const renderProj = (userDocList: TexProjectModel[]): JSX.Element[] => {
        if (!userDocList || userDocList.length === 0) {
            return ([]);
        };
        const tagList: JSX.Element[] = [];
        userDocList.forEach((docItem: TexProjectModel) => {
            const formattedTime = dayjs(docItem.updated_time).format('YYYY-MM-DD HH:mm:ss');
            const projCreatedTime = dayjs(docItem.created_time).format('YYYY-MM-DD HH:mm:ss');
            tagList.push(
                <div key={docItem.project_id} className="list-group-item">
                    <div className={styles.docHeader}>
                        <div className={styles.projTiltle}>
                            <a onClick={() => { handleProjNameClick(docItem) }}>
                                <h6>{docItem.proj_name}</h6>
                            </a>
                        </div>
                        <div className={styles.option}>
                            <div className="dropdown">
                                <button className="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    onClick={(e) => { handleOperClick(e, docItem) }}
                                    aria-expanded="false">
                                    操作
                                </button>
                                {renderMenu(docItem)}
                            </div>
                        </div>
                    </div>
                    <div className={styles.projAttr}>
                        <div><span>来自：</span>{docItem.nickname}</div>
                        <div><span>创建时间：</span>{projCreatedTime}</div>
                        <div><span>更新时间：</span>{formattedTime}</div>
                    </div>
                </div>
            );
        });
        return tagList;
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setProjName(event.target.value);
    };

    const handleFolderNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        let legacyFolder: TexProjectFolder | undefined = currFolder;
        if (legacyFolder) {
            let newFolder: TexProjectFolder = {
                ...legacyFolder,
                folder_name: event.target.value,
            };
            setCurrFolder(newFolder);
        }

    };

    const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        let proj = {
            ...currProject,
            proj_name: event.target.value
        };
        setCurrProject(proj as TexProjectModel);
        setProjName(event.target.value);
    };

    const handleTabClick = (clickTab: number) => {
        setActiveTab(clickTab);
        if (clickTab === ProjTabType.All) {
            let projReq = {
            };
            getProjectList(projReq);
        }
        if (clickTab === ProjTabType.Shared) {
            let projReq = {
                role_id: 2
            };
            getProjectList(projReq);
        }
        if (clickTab === ProjTabType.Archived) {
            let projReq: QueryProjReq = {
                archive_status: 1
            };
            getProjectList(projReq);
        }
        if (clickTab === ProjTabType.Trash) {
            let projReq: QueryProjReq = {
                trash: 1
            };
            getProjectList(projReq);
        }
    }

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.projBody}>
                <div className={styles.projList}>
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className={activeTab === ProjTabType.All ? "nav-link active" : "nav-link"}
                                aria-current="page"
                                onClick={() => { handleTabClick(1) }}
                                href="#">{t("tab_all")}</a>
                        </li>
                        <li className="nav-item">
                            <a className={activeTab === ProjTabType.Shared ? "nav-link active" : "nav-link"}
                                href="#"
                                onClick={() => { handleTabClick(2) }}>{t("tab_shared")}</a>
                        </li>
                        <li className="nav-item">
                            <a className={activeTab === ProjTabType.Archived ? "nav-link active" : "nav-link"}
                                href="#"
                                onClick={() => { handleTabClick(3) }}>{t("tab_archived")}</a>
                        </li>
                        <li className="nav-item">
                            <a className={activeTab === ProjTabType.Trash ? "nav-link active" : "nav-link"}
                                href="#"
                                onClick={() => { handleTabClick(4) }}>{t("tab_trash")}</a>
                        </li>
                    </ul>
                    <div className={styles.docContainer}>
                        <div className={styles.docList}>
                            <div className={styles.docListHeader}>
                                <div className="dropdown">
                                    <button className="btn btn-secondary dropdown-toggle"
                                        type="button"
                                        id="dropdownMenuLink"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        {t("btn_new")}
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                        <li>
                                            <a className="dropdown-item"
                                                data-bs-toggle="modal"
                                                data-bs-target="#newProj">创建空白项目</a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item"
                                                data-bs-toggle="modal"
                                                data-bs-target="#newFolder">新建文件夹</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="list-group">
                                {renderFolder()}
                                <hr />
                                {renderProj(userDocList)}
                            </div>
                        </div>
                        <div className={styles.helpTip}>
                            <p>如果您在使用过程中遇到问题，可发邮件到：
                                <a href="mailto:jiangxiaoqiang@poemhub.top">jiangxiaoqiang@poemhub.top</a>
                                ,我们会第一时间处理
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal" id="delPrj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">删除项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            删除后数据无法恢复，确定删除项目？
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={delProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjDel() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            <FolderDel currFolder={currFolder}
                getProjFilter={getProjFilter} ></FolderDel>
            <FolderRename currFolder={currFolder}
                handleFolderNameChange={handleFolderNameChange}
                getProjFilter={getProjFilter} ></FolderRename>
            <TeXNewFolder
                getProjFilter={getProjFilter}
                projType={activeTab}></TeXNewFolder>
            <TeXBlank
                getProjFilter={getProjFilter}
                handleInputChange={handleInputChange}
                projName={projName}></TeXBlank>
            {
                (currProject && currProject.project_id) ? <TeXMoveToFolder
                    getProjFilter={getProjFilter}
                    projType={activeTab}
                    currProject={currProject} folders={projFolders} currFolder={currFolder} ></TeXMoveToFolder> : <div></div>
            }
            {
                (currProject && currProject.project_id) ? <TeXEdit projectId={currProject.project_id.toString()}
                    getProjFilter={getProjFilter}
                    handleEditInputChange={handleEditInputChange}
                    projName={projName}
                    currProject={currProject} ></TeXEdit> : <div></div>
            }
            {
                (currProject && currProject.project_id) ? <TeXShare projectId={currProject.project_id.toString()}></TeXShare> : <div></div>
            }
            {
                (currProject && currProject.project_id) ? <TeXArchive projectId={currProject.project_id.toString()} currProject={currProject} getProjFilter={getProjFilter}></TeXArchive> : <div></div>
            }
            {
                (currProject && currProject.project_id) ? <TeXTrash projectId={currProject.project_id.toString()} currProject={currProject} getProjFilter={getProjFilter}></TeXTrash> : <div></div>
            }
            {
                (currProject && currProject.project_id) ? <TeXRecovery projectId={currProject.project_id.toString()} currProject={currProject} getProjFilter={getProjFilter} activeTab={activeTab}></TeXRecovery> : <div></div>
            }
            <ToastContainer />
        </div>
    );
}

export default ProjectTab;