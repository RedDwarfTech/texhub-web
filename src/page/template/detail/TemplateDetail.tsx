import React, { useState } from "react";
import styles from "./TemplateDetail.module.css";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { getTplDetail } from "@/service/tpl/TemplateService";
import { useLocation } from "react-router-dom";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import TexHeader from "@/component/header/TexHeader";
import { readConfig } from "@/config/app/config-reader";

const TemplateDetail: React.FC = () => {

    const [tpl, setTpl] = useState<TemplateModel>();
    const { tplDetail } = useSelector((state: AppState) => state.tpl);
    const { state } = useLocation();
    const { id } = state;

    React.useEffect(() => {
        getTplDetail(id);
    }, []);

    React.useEffect(() => {
        setTpl(tplDetail);
    }, [tplDetail]);

    if (!tpl) {
        return (<div></div>);
    };

    const previewTplPdf = () => {
        const pdfUrl = readConfig("tplBaseUrl") + "/" + tpl.pdf_name;
        window.open(pdfUrl, '_blank');
    };

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.container}>
                <h6>模版详情</h6>
                <div className={styles.intro}>模版简介：<span>{tpl.intro}</span></div>
                <div className={styles.tplAction}>
                    <button type="button" className="btn btn-primary">使用此模版</button>
                    <button type="button" className="btn btn-primary" onClick={() => { previewTplPdf() }}>预览模版PDF</button>
                </div>
                <img src={tpl.preview_url} className={styles.tplDemo}></img>
            </div>
        </div>
    );
}

export default TemplateDetail;