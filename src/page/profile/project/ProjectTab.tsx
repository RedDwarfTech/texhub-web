import TexHeader from "@/component/header/TexHeader";
import styles from "./ProjectTab.module.css";
import React, { ChangeEvent, useRef, useState } from "react";
import { createProject, deleteProject, getProjectList } from "@/service/project/ProjectService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { ResponseHandler } from "rdjs-wheel";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import { UserService } from "rd-component";
import TeXShare from "./share/TeXShare";
import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { useTranslation } from "react-i18next";
import TeXEdit from "./edit/TeXEdit";
import TeXArchive from "./archive/TeXArchive";
import TeXTrash from "./trash/TeXTrash";

const ProjectTab: React.FC = () => {

    const [userDocList, setUserDocList] = useState<TexProjectModel[]>([]);
    const [currProject, setCurrProject] = useState<TexProjectModel>();
    const [projName, setProjName] = useState<string>();
    const [activeTab, setActiveTab] = useState<number>(1);
    const { projList } = useSelector((state: AppState) => state.proj);
    const createDocCancelRef = useRef<HTMLButtonElement>(null);
    const delProjCancelRef = useRef<HTMLButtonElement>(null);

    const navigate = useNavigate();
    const { t } = useTranslation();
    const { i18n } = useTranslation();

    React.useEffect(() => {
        getProjectList(getProjFilter());
    }, []);

    React.useEffect(() => {
        setUserDocList(projList);
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
                getProjectList(getProjFilter());
                if (delProjCancelRef && delProjCancelRef.current) {
                    delProjCancelRef.current.click();
                }
            } else {
                toast.error("删除项目失败，{}", resp.msg);
            }
        });
    }

    const getProjFilter = (): QueryProjReq => {
        let query: QueryProjReq = {

        };
        if (activeTab === 1) {
            return query;
        } else if (activeTab === 2) {
            query.role_id = 2;
            return query;
        }
        return query;
    }

    const handleOperClick = (e: React.MouseEvent<HTMLButtonElement>, docItem: TexProjectModel) => {
        e.stopPropagation();
        setCurrProject(docItem);
    }

    const renderMenu = (docItem: TexProjectModel) => {
        if (activeTab === 1) {
            return (
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#delPrj">删除</a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#editPrj">修改项目名称</a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal"
                            onClick={() => { setCurrProject(docItem) }} data-bs-target="#sharePrj">分享项目</a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal"
                            onClick={() => { setCurrProject(docItem) }} data-bs-target="#archiveProj">归档项目
                        </a>
                    </li>
                    <li>
                        <a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#trashPrj">移动到回收站</a>
                    </li>
                </ul>);
        } else if (activeTab === 3) {
            return (
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#delPrj">删除</a></li>
                </ul>
            );
        }
    }

    const renderProj = () => {
        if (!userDocList || userDocList.length === 0) {
            return (<div></div>);
        };
        const tagList: JSX.Element[] = [];
        userDocList.forEach((docItem: TexProjectModel) => {
            const formattedTime = dayjs(docItem.updated_time).format('YYYY-MM-DD HH:mm:ss');
            const projCreatedTime = dayjs(docItem.created_time).format('YYYY-MM-DD HH:mm:ss');
            tagList.push(
                <div key={docItem.project_id} className="list-group-item">
                    <div className={styles.docHeader}>
                        <div className={styles.projTiltle}>
                            <a onClick={() => { navigate("/editor?pid=" + docItem.project_id) }}>
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

    const handleProjCreate = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning("登录后即可创建项目");
            return;
        }
        if (projName == null || projName.length == 0) {
            toast.warning("请填写项目名称");
            return;
        }
        if (projName.length > 256) {
            toast.warning("超过项目名称长度限制");
            return;
        }
        let doc = {
            name: projName == null ? "" : projName
        };
        createProject(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getProjectList(getProjFilter());
                if (createDocCancelRef && createDocCancelRef.current) {
                    createDocCancelRef.current.click();
                }
            }
        });
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setProjName(event.target.value);
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
        if (clickTab === 1) {
            let projReq = {
            };
            getProjectList(projReq);
        }
        if (clickTab === 2) {
            let projReq = {
                role_id: 2
            };
            getProjectList(projReq);
        }
        if (clickTab === 3) {
            let projReq: QueryProjReq = {
                archive_status: 1
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
                            <a className={activeTab === 1 ? "nav-link active" : "nav-link"}
                                aria-current="page"
                                onClick={() => { handleTabClick(1) }}
                                href="#">{t("tab_all")}</a>
                        </li>
                        <li className="nav-item">
                            <a className={activeTab === 2 ? "nav-link active" : "nav-link"}
                                href="#"
                                onClick={() => { handleTabClick(2) }}>{t("tab_shared")}</a>
                        </li>
                        <li className="nav-item">
                            <a className={activeTab === 3 ? "nav-link active" : "nav-link"}
                                href="#"
                                onClick={() => { handleTabClick(3) }}>{t("tab_archived")}</a>
                        </li>
                    </ul>
                    <div className={styles.docContainer}>
                        <div className={styles.docList}>
                            <div className={styles.docListHeader}>
                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newPrj">
                                    {t("btn_new")}
                                </button>
                            </div>
                            <div className="list-group">
                                {renderProj()}
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
            <div className="modal" id="newPrj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">新建项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="projName" onChange={handleInputChange} className="form-control" placeholder="项目名称"></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={createDocCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjCreate() }}>确定</button>
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
            <ToastContainer />
        </div>
    );
}

export default ProjectTab;