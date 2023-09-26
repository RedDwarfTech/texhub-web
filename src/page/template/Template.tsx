import TexHeader from "@/component/header/TexHeader";
import styles from "./Template.module.css";
import React, { useState } from "react";
import { getTplList } from "@/service/tpl/TemplateService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { useNavigate } from "react-router-dom";

const Template: React.FC = () => {

    const [userTplList, setUserTplList] = useState<TemplateModel[]>([]);
    const [tplType, setTplType] = useState<number>(1);
    const { tplList } = useSelector((state: AppState) => state.tpl);
    const navigate = useNavigate();

    React.useEffect(() => {
        getTplList("");
    }, []);

    React.useEffect(() => {
        setUserTplList(tplList);
    }, [tplList])

    const renderTplList = () => {
        if (!userTplList || userTplList.length === 0) {
            return (<div></div>);
        }
        const tagList: JSX.Element[] = [];
        userTplList.forEach((docItem: TemplateModel) => {
            tagList.push(
                <div key={docItem.id} className={`${styles.tplCard} card`}>
                    <img src={docItem.preview_url} className="card-img-top" onClick={() => { navigate("/tpl/detail", { state: { id: docItem.template_id } }) }} alt="..."></img>
                    <div className="card-body">
                        <h6 className="card-title">{docItem.name}</h6>
                    </div>
                </div>
            );
        });
        return tagList;
    }

    const searchTplList = () => {
        const selectElement = document.getElementById('tpl-type') as HTMLSelectElement;
        const selectedValue = selectElement.value;
        const searchElement = document.getElementById('stext') as HTMLInputElement;
        const searchValue = searchElement.value;
        getTplList(searchValue, selectedValue);
    }

    const selectChanged = (e: any) => {
        let val = e.target.value;
        setTplType(Number(val));
    }

    return (
        <div className={styles.tplContainer}>
            <TexHeader></TexHeader>
            <div className={styles.tplBody}>
                <div className={styles.tplFilter}>
                    <div className="mb-3 col-2">
                        <select id="tpl-type" className="form-select" defaultValue="1" onChange={selectChanged}>
                            <option value="1">简历</option>
                            <option value="2">推荐信</option>
                            <option value="3">论文</option>
                            <option value="4">毕业设计</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <input id="stext" type="text" className="form-control" placeholder="输入检索关键字" aria-label="Recipient's username" aria-describedby="button-addon2" />
                        <button className="btn btn-outline-secondary" onClick={() => { searchTplList() }} type="button" id="button-addon2">查询</button>
                    </div>
                </div>
                <div className={styles.container}>
                    {renderTplList()}
                </div>
            </div>
        </div>
    );
}

export default Template;