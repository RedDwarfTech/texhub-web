import TexHeader from "@/component/header/TexHeader";
import styles from "./ProjectTab.module.css";
import React, { useRef, useState } from "react";
import { createProject, deleteProject, getProjectList } from "@/service/project/ProjectService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexProjectModel } from "@/model/prj/TexProjectModel";
import { ResponseHandler } from "rdjs-wheel";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import { UserService } from "rd-component";
import TeXShare from "./share/TeXShare";

const ProjectTab: React.FC = () => {

    const [userDocList, setUserDocList] = useState<TexProjectModel[]>([]);
    const [currProject, setCurrProject] = useState<TexProjectModel>();
    const [projName, setProjName] = useState<string>();
    const { projList } = useSelector((state: AppState) => state.proj);
    const createDocCancelRef = useRef<HTMLButtonElement>(null);
    const delProjCancelRef = useRef<HTMLButtonElement>(null);
    const editProjCancelRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        getProjectList("");
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
                getProjectList("all");
                if (delProjCancelRef && delProjCancelRef.current) {
                    delProjCancelRef.current.click();
                }
            } else {
                toast.error("删除项目失败，{}", resp.msg);
            }
        });
    }

    const handleProjEdit = () => {
        if (!currProject) {
            toast.info("请选择删除项目");
        }
        let proj = {
            project_id: currProject?.project_id
        };
        deleteProject(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList("all");
                if (delProjCancelRef && delProjCancelRef.current) {
                    delProjCancelRef.current.click();
                }
            } else {
                toast.error("删除项目失败，{}", resp.msg);
            }
        });
    }

    const renderProj = () => {
        if (!userDocList || userDocList.length === 0) {
            return (<div></div>);
        };
        const tagList: JSX.Element[] = [];
        userDocList.forEach((docItem: TexProjectModel) => {
            const formattedTime = dayjs(docItem.updated_time).format('YYYY-MM-DD HH:mm:ss');
            tagList.push(
                <label key={docItem.project_id} className="list-group-item">
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
                                    onClick={() => { setCurrProject(docItem) }}
                                    aria-expanded="false">
                                    操作
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li><a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#delPrj">删除</a></li>
                                    <li><a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#editPrj">修改项目名称</a></li>
                                    <li><a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setCurrProject(docItem) }} data-bs-target="#sharePrj">分享项目</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>更新时间：{formattedTime}</div>
                    </div>
                </label>
            );
        });
        return tagList;
    };

    const handleDocCreate = () => {
        if (!UserService.isLoggedIn()) {
            toast.warning("登录后即可创建项目");
            return;
        }
        let doc = {
            name: projName == null ? "" : projName
        };
        createProject(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getProjectList("all");
                if (createDocCancelRef && createDocCancelRef.current) {
                    createDocCancelRef.current.click();
                }
            }
        });
    };

    const handleInputChange = (event: any) => {
        setProjName(event.target.value);
    };

    const handleEditInputChange = (event: any) => {
        let proj = {
            ...currProject,
            proj_name: event.target.value
        };
        setCurrProject(proj as TexProjectModel);
    };

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.projBody}>
                <div className={styles.projList}>
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="#">全部</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">分享给我</a>
                        </li>
                    </ul>
                    <div className={styles.docContainer}>
                        <div className={styles.docList}>
                            <div className={styles.docListHeader}>
                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newPrj">
                                    新建
                                </button>
                            </div>
                            <div className="list-group">
                                {renderProj()}
                            </div>
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
                            <button type="button" className="btn btn-primary" onClick={() => { handleDocCreate() }}>确定</button>
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
            <div className="modal" id="editPrj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">编辑项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input id="editProjName"
                                onChange={handleEditInputChange}
                                className="form-control"
                                value={currProject?.proj_name.toString() || ""}
                                placeholder="项目名称"></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjEdit() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            {
                (currProject && currProject.project_id) ? <TeXShare projectId={currProject.project_id.toString()}></TeXShare> : <div></div>
            }
            <ToastContainer />
        </div>
    );
}

export default ProjectTab;