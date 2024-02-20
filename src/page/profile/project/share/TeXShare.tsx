import { readConfig } from "@/config/app/config-reader";
import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { writeText } from 'clipboard-polyfill';
import { ProjShareTabType } from "@/model/proj/config/ProjShareTabType";
import { useTranslation } from "react-i18next";
import styles from "./TexShare.module.css";
import Table from 'rc-table';

export type ShareProps = {
    projectId: string;
};

const TeXShare: React.FC<ShareProps> = (props: ShareProps) => {

    const [projShareLink, setProjShareLink] = useState<string>();
    const [activeTab, setActiveTab] = useState<ProjShareTabType>(1);
    const { t } = useTranslation();

    React.useEffect(() => {
        let shareLink = readConfig("shareBaseUrl") + "?projectId=" + props.projectId;
        setProjShareLink(shareLink);
    }, []);

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
                toast.error('Failed to copy:', error);
            });
    }

    const handleTabClick = (clickTab: number) => {
        setActiveTab(clickTab);
        if (clickTab === ProjShareTabType.Link) {
        }
        if (clickTab === ProjShareTabType.Mail) {
        }
    }

    const selectChanged = (e: any) => {
        let val = e.target.value;
    }

    const columns = [
        {
            title: '用户',
            dataIndex: 'snippet',
            key: 'snippet',
            width: 100,
        },
        {
            title: '协作权限',
            dataIndex: 'action',
            key: 'action',
            width: 100,
        },
        {
            title: '操作',
            dataIndex: '',
            key: 'operations',
            render: () => {
                return (
                    <div className={styles.oper}>
                        <a href="#">删除</a>
                    </div>
                );
            },
        },
    ];

    const data = [{ snippet: "jiangxiaoqiang",action:"edit" }];

    const renderShareBody = () => {
        if (activeTab === 1) {
            return (
                <div className="modal-body">
                    <div className={styles.sharedSection}>
                        <span>权限：</span>
                        <select id="tpl-type" className="form-select" defaultValue="0" onChange={selectChanged}>
                            <option value="1">允许编辑</option>
                            <option value="2" disabled>仅查看</option>
                        </select>
                    </div>
                    <div className={styles.sharedSection}>
                        <span>分享方式：</span>
                        <input className="form-check-input" type="checkbox" value="" id="checkboxLink" checked></input>
                        <label className="form-check-label">链接分享</label>
                    </div>
                    <div className={styles.sharedSection}>
                        <div>分享链接：</div>
                        <div>{projShareLink}</div>
                    </div>
                    <div className={styles.sharedSection}>
                        <button type="button" className="btn btn-primary" onClick={() => { handleShareLinkCopy() }}>拷贝</button>
                    </div>
                </div>
            );
        }
        if (activeTab === 2) {
            return (
                <div className={styles.sharedAdminTable}>
                    <Table columns={columns} data={data} />
                </div>
            );
        }
    }

    return (
        <div>
            <div className="modal" id="sharePrj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">分享项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <a className={activeTab === ProjShareTabType.Link ? "nav-link active" : "nav-link"}
                                    aria-current="page"
                                    onClick={() => { handleTabClick(1) }}
                                    href="#">{t("tab_proj_share")}</a>
                            </li>
                            <li className="nav-item">
                                <a className={activeTab === ProjShareTabType.Mail ? "nav-link active" : "nav-link"}
                                    href="#"
                                    onClick={() => { handleTabClick(2) }}>{t("tab_proj_share_admin")}</a>
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
}

export default TeXShare;