import TexHeader from "@/component/header/TexHeader";
import styles from "./Template.module.css";
import React, { useState } from "react";
import { getTplPage } from "@/service/tpl/TemplateService";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Template: React.FC = () => {
  const [userTplList, setUserTplList] = useState<TemplateModel[]>([]);
  const [tplType, setTplType] = useState<number>(1);
  const [curPage, setCurPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const { tplPage } = useSelector((state: AppState) => state.tpl);
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    getTplPage(1, "");
  }, []);

  React.useEffect(() => {
    if (tplPage && Object.keys(tplPage).length > 0) {
      setUserTplList(tplPage.data ?? []);
      setCurPage(tplPage.pagination.pageNum);
      let totalPage = tplPage.pagination.total / tplPage.pagination.pageSize;
      setTotalPage(Math.ceil(totalPage));
    }
  }, [tplPage]);

  const renderTplPage = () => {
    if (!userTplList || userTplList.length === 0) {
      return <div></div>;
    }
    const tagList: JSX.Element[] = [];
    userTplList.forEach((docItem: TemplateModel) => {
      tagList.push(
        <div key={docItem.id} className={`${styles.tplCard} card`}>
          <img
            src={docItem.preview_url}
            className="card-img-top"
            onClick={() => {
              navigate("/tpl/detail", { state: { id: docItem.template_id } });
            }}
            alt="..."
          ></img>
          <div className="card-body">
            <h6 className="card-title">{docItem.name}</h6>
          </div>
        </div>
      );
    });
    return tagList;
  };

  const searchTplList = () => {
    const selectElement = document.getElementById(
      "tpl-type"
    ) as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const searchElement = document.getElementById("stext") as HTMLInputElement;
    const searchValue = searchElement.value;
    getTplPage(1, searchValue, selectedValue);
  };

  const selectChanged = (e: any) => {
    let val = e.target.value;
    setTplType(Number(val));
  };

  const handlePageUp = (e: any) => {
    if (!curPage || curPage < 2) return;
    const searchElement = document.getElementById("stext") as HTMLInputElement;
    const searchValue = searchElement.value;
    const selectElement = document.getElementById(
      "tpl-type"
    ) as HTMLSelectElement;
    const selectedValue = selectElement.value;
    getTplPage(curPage - 1, searchValue, selectedValue);
  };

  const handlePageDown = (e: any) => {
    if (!curPage || curPage >= totalPage) return;
    const searchElement = document.getElementById("stext") as HTMLInputElement;
    const searchValue = searchElement.value;
    const selectElement = document.getElementById(
      "tpl-type"
    ) as HTMLSelectElement;
    const selectedValue = selectElement.value;
    getTplPage(curPage + 1, searchValue, selectedValue);
  };

  return (
    <div className={styles.tplContainer}>
      <TexHeader></TexHeader>
      <div className={styles.tplBody}>
        <div className={styles.tplFilter}>
          <div className="mb-3 col-2">
            <select
              id="tpl-type"
              className="form-select"
              defaultValue="0"
              onChange={selectChanged}
            >
              <option value="">{t("label_all")}</option>
              <option value="1">{t("label_resume")}</option>
              <option value="2">{t("label_recommend_letters")}</option>
              <option value="3">{t("label_paper")}</option>
              <option value="4">{t("label_graduate_design")}</option>
              <option value="5">{t("label_book")}</option>
              <option value="6">{t("label_others")}</option>
            </select>
          </div>
          <div className="input-group mb-3">
            <input
              id="stext"
              type="text"
              className="form-control"
              placeholder={t("tips_enter_keyword")}
              aria-label="Recipient's username"
              aria-describedby="button-addon2"
            />
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                searchTplList();
              }}
              type="button"
              id="button-addon2"
            >
              {t("btn_search")}
            </button>
          </div>
        </div>
        <div className={styles.container}>{renderTplPage()}</div>
      </div>
      <div className={styles.pageAction}>
        <div onClick={(e) => handlePageUp(e)}>{t("btn_prev_page")}</div>
        <div onClick={(e) => handlePageDown(e)}>{t("btn_next_page")}</div>
      </div>
    </div>
  );
};

export default Template;
