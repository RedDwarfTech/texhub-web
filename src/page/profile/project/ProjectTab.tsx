import TexHeader from "@/component/header/TexHeader";
import styles from "./ProjectTab.module.css";
import React, { useRef, useState } from "react";
import { createDoc, deleteProject, getProjectList as getProjectList } from "@/service/project/ProjectService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { ResponseHandler } from "rdjs-wheel";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';

const DocTab: React.FC = () => {

    const [userDocList, setUserDocList] = useState<TexProjectModel[]>([]);
    const [delProject, setDelProject] = useState<TexProjectModel>();
    const [docName, setDocName] = useState<string>();
    const { projList } = useSelector((state: AppState) => state.proj);
    const createDocCancelRef = useRef<HTMLButtonElement>(null);
    const delProjCancelRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        getProjectList("all");
    }, []);

    React.useEffect(() => {
        setUserDocList(projList);
        console.log("doclist:", projList);
    }, [projList]);

    const handleProjDel = () => {
        if (!delProject) {
            toast.info("请选择删除项目");
        }
        let proj = {
            project_id: delProject?.project_id
        };
        deleteProject(proj).then((resp) => {
            if(ResponseHandler.responseSuccess(resp)){
                getProjectList("all");
                if (delProjCancelRef && delProjCancelRef.current) {
                    delProjCancelRef.current.click();
                }
            }else{
                toast.error("删除项目失败，{}",resp.msg);
            }
        });
    }

    const renderDoc = () => {
        if (!userDocList || userDocList.length === 0) {
            return (<div></div>);
        };
        const tagList: JSX.Element[] = [];
        userDocList.forEach((docItem: TexProjectModel) => {
            tagList.push(
                <label key={docItem.project_id} className="list-group-item">
                    <div className={styles.docHeader}>
                        <input className="form-check-input me-1" type="checkbox" value="" />
                        <span><a onClick={() => { navigate("/editor?pid=" + docItem.project_id) }}>{docItem.doc_name}</a></span>
                        <div className={styles.option}>
                            <div className="dropdown">
                                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                    操作
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li><a className="dropdown-item" data-bs-toggle="modal" onClick={() => { setDelProject(docItem) }} data-bs-target="#delPrj">删除</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>更新时间：{docItem.updated_time}</div>
                    </div>
                </label>
            );
        });
        return tagList;
    };

    const handleDocCreate = () => {
        let doc: TexProjectModel = {
            doc_name: docName == null ? "" : docName,
            template_id: 0,
            created_time: "",
            updated_time: "",
            project_id: ""
        };
        createDoc(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getProjectList("all");
                if (createDocCancelRef && createDocCancelRef.current) {
                    createDocCancelRef.current.click();
                }
            }
        });
    };

    const handleInputChange = (event: any) => {
        setDocName(event.target.value);
    };

    return (
        <div>
            <TexHeader></TexHeader>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">全部</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#">分享</a>
                </li>
            </ul>
            <div className={styles.docContainer}>
                <div className={styles.docList}>
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newPrj">
                        新建
                    </button>
                    <div className="list-group">
                        {renderDoc()}
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
                            <input id="docName" onChange={handleInputChange} className="form-control" placeholder="项目名称"></input>
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
            <ToastContainer />
        </div>
    );
}

export default DocTab;