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
import { UserService } from "rd-component";
import { useTranslation } from "react-i18next";

const TemplateDetail: React.FC = () => {
  const [tpl, setTpl] = useState<TemplateModel>();
  const { tplDetail } = useSelector((state: AppState) => state.tpl);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = state;
  const { t } = useTranslation();

  React.useEffect(() => {
    getTplDetail(id);
  }, []);

  React.useEffect(() => {
    setTpl(tplDetail);
  }, [tplDetail]);

  if (!tpl) {
    return <div></div>;
  }

  const previewTplPdf = () => {
    const pdfUrl = readConfig("tplBaseUrl") + "/" + tpl.pdf_name;
    window.open(pdfUrl, "_blank");
  };

  const openTplSrc = (tpl: TemplateModel) => {
    if (!tpl || !tpl.source) return;
    window.open(tpl.source);
  };

  const createProjByTpl = () => {
    let req: CreateTplProjReq = {
      template_id: tpl.template_id,
    };
    createProjectFromTpl(req).then((res) => {
      if (ResponseHandler.responseSuccess(res)) {
        let proj_id = res.result.project_id;
        navigate("/editor?pid=" + proj_id);
      } else {
        toast.error(res.msg);
      }
    });
  };

  const renderLoggedInBtn = () => {
    if (UserService.isLoggedIn()) {
      return (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            createProjByTpl();
          }}
        >
          {t("btn_create_proj_by_tpl")}
        </button>
      );
    }
  };

  return (
    <div>
      <TexHeader></TexHeader>
      <div className={styles.container}>
        <h6>{t("title_template_detail")}</h6>
        <div className={styles.intro}>
          {t("label_template_intro")}：<span>{tpl.intro}</span>
        </div>
        <div className={styles.tplAction}>
          {renderLoggedInBtn()}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              previewTplPdf();
            }}
          >
            {t("btn_preview")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              openTplSrc(tpl);
            }}
          >
            {t("btn_template_source")}
          </button>
        </div>
        <img
          alt="preview"
          src={tpl.preview_url}
          className={styles.tplDemo}
        ></img>
      </div>
    </div>
  );
};

export default TemplateDetail;
