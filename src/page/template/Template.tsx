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

    React.useEffect(() => {
        setUserTplList(tplList);
    },[tplList])

    const renderTplList = () => {
        if (!userTplList || userTplList.length === 0) {
            return (<div></div>);
        }
        const tagList: JSX.Element[] = [];
        userTplList.forEach((docItem: TemplateModel) => {
            tagList.push(
                <div className={`${styles.tplCard} card`}>
                    <img src={docItem.preview_url} className="card-img-top" alt="..."></img>
                    <div className="card-body">
                        <h6 className="card-title">{docItem.name}</h6>
                    </div>
                </div>
            );
        });
        return tagList;
    }

    return (
    <div>
        <TexHeader></TexHeader>
        <div className={styles.tplBody}>
            <div className={styles.container}>
                {renderTplList()}
            </div>
        </div>
    </div>
    );
}

export default Template;