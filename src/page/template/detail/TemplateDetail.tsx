import React, { useState } from "react";
import styles from "./TemplateDetail.module.css";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { getTplDetail } from "@/service/tpl/TemplateService";
import { useLocation } from "react-router-dom";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import TexHeader from "@/component/header/TexHeader";


const TemplateDetail: React.FC = () => {

    const [tpl, setTpl] = useState<TemplateModel>();
    const { tplDetail } = useSelector((state: AppState) => state.tpl);
    const { state } = useLocation();
    const { id } = state;

    React.useEffect(() => {
        // debugger
        getTplDetail(id);
    }, []);

    React.useEffect(() => {
        setTpl(tplDetail);
    }, [tplDetail]);

    if (!tpl) {
        return (<div></div>);
    }

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.container}>
                <div>模版详情</div>
                <div>简介：<p>{tpl.intro}</p></div>
                <img src={tpl.preview_url} className={styles.tplDemo}></img>
            </div>
        </div>
    );
}

export default TemplateDetail;