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
      toast.error("项目ID获取失败");
      return;
    }
    if (!projShareLink || projShareLink.length === 0) {
      toast.error("分享链接生成异常");
      return;
    }
    writeText(projShareLink)
      .then(() => {
        toast.success("拷贝成功");
      })
      .catch((error) => {
        toast.error("Failed to copy:", error);
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
      title: "用户",
      dataIndex: "nickname",
      key: "nickname",
      width: 140,
    },
    {
      title: "加入时间",
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
      title: "角色",
      dataIndex: "role_id",
      key: "role_id",
      width: 100,
      render: (value: number) => {
        if (value === 1) {
          return (<div>创建者</div>);
        } else {
          return (<div>协作者</div>);
        }
      },
    },
    {
      title: "协作状态",
      dataIndex: "collar_status",
      key: "collar_status",
      width: 100,
      render: (val: number) => {
        if (val === CollarType.NORMAL) {
          return <div>正常</div>;
        } else if (val === CollarType.EXIT) {
          return <div>退出协作</div>;
        } else {
          return <div>未知</div>;
        }
      },
    },
    {
      title: "操作",
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
            <span>权限：</span>
            <select
              id="tpl-type"
              className="form-select"
              defaultValue="0"
              onChange={selectChanged}
            >
              <option value="1">允许编辑</option>
              <option value="2" disabled>
                仅查看
              </option>
            </select>
          </div>
          <div className={styles.sharedSection}>
            <span>分享方式：</span>
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="checkboxLink"
            ></input>
            <label className="form-check-label">链接分享</label>
          </div>
          <div className={styles.sharedSection}>
            <div>分享链接：</div>
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
