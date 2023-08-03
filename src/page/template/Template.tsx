import TexHeader from "@/component/header/TexHeader";
import styles from "./Template.module.css";
import React, { useRef, useState } from "react";
import { getTplList } from "@/service/tpl/TemplateService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TemplateModel } from "@/model/tpl/TemplateModel";

const Template: React.FC = () => {

    const [userTplList, setUserTplList] = useState<TemplateModel[]>([]);
    const [docName, setDocName] = useState<string>();
    const { tplList } = useSelector((state: AppState) => state.tpl);
    const createDocCancelRef = useRef<HTMLButtonElement>(null);
    
    React.useEffect(() => {
        getTplList("all");
    },[]);

    const renderTplList = () => {
        if (!userTplList || userTplList.length === 0) {
            return (<div></div>);
        }
        const tagList: JSX.Element[] = [];
        userTplList.forEach((docItem: TemplateModel) => {
            tagList.push(
                <label className="list-group-item">
                    <div className={styles.docHeader}>
                        <input className="form-check-input me-1" type="checkbox" value="" />
                        <span>{docItem.name}</span>
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
    }

    return (
    <div>
        <TexHeader></TexHeader>
        <div className={styles.container}>
            {renderTplList()}
        </div>
    </div>
    );
}

export default Template;