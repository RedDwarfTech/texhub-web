import TexHeader from "@/component/header/TexHeader";
import styles from "./DocTab.module.css";
import React, { useRef, useState } from "react";
import { createDoc, getDocList } from "@/service/doc/DocService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TexDocModel } from "@/model/doc/TexDocModel";
import { ResponseHandler } from "rdjs-wheel";

const DocTab: React.FC = () => {

    const [userDocList, setUserDocList] = useState<TexDocModel[]>([]);
    const [docName, setDocName] = useState<string>();
    const { docList } = useSelector((state: AppState) => state.doc);
    const createDocCancelRef = useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        getDocList("all");
    }, []);

    React.useEffect(() => {
        setUserDocList(docList);
        console.log("doclist:", docList);
    }, [docList]);

    const renderDoc = () => {
        if (!userDocList || userDocList.length === 0) {
            return (<div></div>);
        }
        const tagList: JSX.Element[] = [];
        userDocList.forEach((docItem: TexDocModel) => {
            tagList.push(
                <label className="list-group-item">
                    <div className={styles.docHeader}>
                        <input className="form-check-input me-1" type="checkbox" value="" />
                        <span>{docItem.doc_name}</span>
                        <div className={styles.option}>
                            <div className="dropdown">
                                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                    操作
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li><a className="dropdown-item" href="#">删除</a></li>
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
        let doc: TexDocModel = {
            doc_name: docName == null ? "" : docName,
            template_id: 0,
            created_time: "",
            updated_time: ""
        };
        createDoc(doc).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                getDocList("all");
                if(createDocCancelRef&&createDocCancelRef.current){
                    createDocCancelRef.current.click();
                }
            }
        });
    }

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
        </div>
    );
}

export default DocTab;