import React, { useState } from "react";
import styles from "./TemplateDetail.module.css";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { getTplDetail } from "@/service/tpl/TemplateService";
import { useLocation, useNavigate } from "react-router-dom";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import TexHeader from "@/component/header/TexHeader";
import { readConfig } from "@/config/app/config-reader";
import { createProjectFromTpl } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { toast } from "react-toastify";
import { CreateTplProjReq } from "@/model/request/proj/create/CreateTplProjReq";

const TemplateDetail: React.FC = () => {

    const [tpl, setTpl] = useState<TemplateModel>();
    const { tplDetail } = useSelector((state: AppState) => state.tpl);
    const navigate = useNavigate();
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

    const createProjByTpl = () => {
        let req:CreateTplProjReq =  {
            template_id: tpl.template_id
        };
        createProjectFromTpl(req).then((res) => {
            if(ResponseHandler.responseSuccess(res)){
                let proj_id = res.result.project_id;
                navigate('/editor?pid=' + proj_id);
            }else{
                toast.error(res.msg)
            }
        });
    }

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.container}>
                <h6>模版详情</h6>
                <div className={styles.intro}>模版简介：<span>{tpl.intro}</span></div>
                <div className={styles.tplAction}>
                    <button type="button" className="btn btn-primary" onClick={()=>{createProjByTpl()}}>以此模版创建项目</button>
                    <button type="button" className="btn btn-primary" onClick={() => { previewTplPdf() }}>预览模版PDF</button>
                </div>
                <img src={tpl.preview_url} className={styles.tplDemo}></img>
            </div>
        </div>
    );
}

export default TemplateDetail;