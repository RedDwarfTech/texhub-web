import { readConfig } from "@/config/app/config-reader";
import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { writeText } from "clipboard-polyfill";
import { ProjShareTabType } from "@/model/proj/config/ProjShareTabType";
import { useTranslation } from "react-i18next";
import styles from "./TexShare.module.css";
import Table from "rc-table";
import { getProjCollarUsers } from "@/service/project/share/ProjectShareService";
import { QueryProjCollar } from "@/model/request/proj/query/QueryProjCollar";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { ProjCollarModel } from "@/model/proj/share/ProjCollarModel";
import { CollarType } from "@/model/enum/CollarType";
import dayjs from "dayjs";
import { BaseMethods } from "rdjs-wheel";

export type ShareProps = {
  projectId: string;
};

const TeXShare: React.FC<ShareProps> = (props: ShareProps) => {
  const [projShareLink, setProjShareLink] = useState<string>();
  const [activeTab, setActiveTab] = useState<ProjShareTabType>(1);
  const [curCollar, setCurCollar] = useState<ProjCollarModel[]>([]);
  const { collar } = useSelector((state: AppState) => state.projShare);
  const { t } = useTranslation();

  React.useEffect(() => {
    let shareLink =
      readConfig("shareBaseUrl") + "?projectId=" + props.projectId;
    setProjShareLink(shareLink);
  }, [props.projectId]);

  React.useEffect(() => {
    if (collar) {
      setCurCollar(collar);
    }
  }, [collar]);

  const handleShareLinkCopy = () => {
    if (!props.projectId || props.projectId.length === 0) {
      toast.error(t("err_proj_id_failed"));
      return;
    }
    if (!projShareLink || projShareLink.length === 0) {
      toast.error(t("err_share_link_failed"));
      return;
    }
    writeText(projShareLink)
      .then(() => {
        toast.success(t("tips_copy_success"));
      })
      .catch((error) => {
        toast.error(t("err_copy_failed"), error);
      });
  };

  const handleTabClick = (clickTab: number) => {
    setActiveTab(clickTab);
    if (clickTab === ProjShareTabType.Link) {
    }
    if (clickTab === ProjShareTabType.Mail) {
      let req: QueryProjCollar = {
        project_id: props.projectId,
      };
      getProjCollarUsers(req);
    }
  };

  const selectChanged = (e: any) => {
    let val = e.target.value;
  };

  const columns = [
    {
      title: t("label_user"),
      dataIndex: "nickname",
      key: "nickname",
      width: 140,
    },
    {
      title: t("label_join_time"),
      dataIndex: "created_time",
      key: "created_time",
      width: 200,
      render: (value: number) => {
        const formattedDate = dayjs
          .unix(value / 1000)
          .format("YYYY-MM-DD HH:mm:ss");
        return formattedDate;
      },
    },
    {
      title: t("label_role"),
      dataIndex: "role_id",
      key: "role_id",
      width: 100,
      render: (value: number) => {
        if (value === 1) {
          return (<div>{t("label_creator")}</div>);
        } else {
          return (<div>{t("label_collaborator")}</div>);
        }
      },
    },
    {
      title: t("label_collab_status"),
      dataIndex: "collar_status",
      key: "collar_status",
      width: 100,
      render: (val: number) => {
        if (val === CollarType.NORMAL) {
          return <div>{t("label_status_normal")}</div>;
        } else if (val === CollarType.EXIT) {
          return <div>{t("label_status_quit")}</div>;
        } else {
          return <div>{t("label_status_unknown")}</div>;
        }
      },
    },
    {
      title: t("btn_action"),
      dataIndex: "",
      key: "operations",
      render: () => {
        return (
          <div className={styles.oper}>
            <button className="btn btn-primary">{t("btn_del")}</button>
          </div>
        );
      },
    },
  ];

  const renderShareBody = () => {
    if (activeTab === 1) {
      return (
        <div className="modal-body">
          <div className={styles.sharedSection}>
            <span>{t("label_permission")}</span>
            <select
              id="tpl-type"
              className="form-select"
              defaultValue="0"
              onChange={selectChanged}
            >
              <option value="1">{t("label_allow_edit")}</option>
              <option value="2" disabled>
                {t("label_view_only")}
              </option>
            </select>
          </div>
          <div className={styles.sharedSection}>
            <span>{t("label_share_method")}</span>
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="checkboxLink"
            ></input>
            <label className="form-check-label">{t("label_link_share")}</label>
          </div>
          <div className={styles.sharedSection}>
            <div>{t("label_share_link")}</div>
            <div>{projShareLink}</div>
          </div>
          <div className={styles.sharedSection}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                handleShareLinkCopy();
              }}
            >
              {t("btn_copy")}
            </button>
          </div>
        </div>
      );
    }
    if (activeTab === 2) {
      if(BaseMethods.isNull(curCollar)){
        return;
      }
      return (
        <div className={styles.sharedAdminTable}>
          <Table columns={columns} data={curCollar} />
        </div>
      );
    }
  };

  return (
    <div>
      <div className="modal modal-lg" id="sharePrj" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("title_share_proj")}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <a
                  className={
                    activeTab === ProjShareTabType.Link
                      ? "nav-link active"
                      : "nav-link"
                  }
                  aria-current="page"
                  onClick={() => {
                    handleTabClick(1);
                  }}
                  href="#/"
                >
                  {t("tab_proj_share")}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={
                    activeTab === ProjShareTabType.Mail
                      ? "nav-link active"
                      : "nav-link"
                  }
                  href="#/"
                  onClick={() => {
                    handleTabClick(2);
                  }}
                >
                  {t("tab_proj_share_admin")}
                </a>
              </li>
            </ul>
            {renderShareBody()}
            <div className="modal-footer">
              {/**<button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjEdit() }}>确定</button>**/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeXShare;
