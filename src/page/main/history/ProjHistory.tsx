import { useSelector } from "react-redux";
import styles from "./ProjHistory.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { getProjHistoryDetail, replaceTextToEditor } from "@/service/project/ProjectService";
import dayjs from "dayjs";
import { QueryHistoryDetail } from "@/model/request/proj/query/QueryHistoryDetail";
import { ResponseHandler } from "rdjs-wheel";
import * as Y from 'rdyjs';
import { useTranslation } from "react-i18next";
import ProjHistoryDetail from "./detail/ProjHistoryDetail";

export type HistoryProps = {
    projectId: string;
};

const ProjHistory: React.FC<HistoryProps> = (props: HistoryProps) => {

    const { projHisPage } = useSelector((state: AppState) => state.proj);
    const { t } = useTranslation();

    const getHistoryDetail = (id: number) => {
        const hist: QueryHistoryDetail = {
            id: id
        };
        getProjHistoryDetail(hist);
    }

    const restoreProjHistories = (snapId: number) => {
        const hist: QueryHistoryDetail = {
            id: snapId
        };
        getProjHistoryDetail(hist).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                let snapshot = resp.result.content;
                replaceTextToEditor(snapshot);
                /**if(snapshot && curDoc){
                    let ss: Uint8Array = base64ToUint8Array(snapshot);
                    const decoded = Y.decodeSnapshot(ss);
                    const docRestored = Y.createDocFromSnapshot(curDoc, decoded);
                    replaceTextToEditor(docRestored);
                    console.log(docRestored);
                }**/
            }
        });
    }

    const cardStyle: React.CSSProperties = {
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        background: '#f9fafb',
        marginBottom: '18px',
        padding: '18px 20px 12px 20px',
        transition: 'box-shadow 0.2s',
        border: '1px solid #ececec',
        position: 'relative',
    };
    const cardHoverStyle: React.CSSProperties = {
        ...cardStyle,
        boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
        background: '#f5f7fa',
    };
    const diffBlockStyle: React.CSSProperties = {
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        background: '#fff',
        padding: '10px 12px',
        margin: '10px 0',
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: 1.7,
        overflowX: 'auto',
    };
    const infoRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    };
    const btnGroupStyle: React.CSSProperties = {
        display: 'flex',
        gap: '12px',
    };
    const fileNameStyle: React.CSSProperties = {
        fontWeight: 600,
        fontSize: '15px',
        color: '#2d3a4b',
    };
    const timeStyle: React.CSSProperties = {
        fontSize: '13px',
        color: '#888',
    };

    const renderDiff = (diffStr: string) => {
        if (!diffStr) return null;
        let diffArr: any[] = [];
        try {
            diffArr = JSON.parse(diffStr);
        } catch (e) {
            return <div>diff 解析失败</div>;
        }
        return (
            <div style={diffBlockStyle}>
                <pre style={{whiteSpace: 'pre-wrap', fontSize: '13px', margin: 0, background: 'none', border: 'none', padding: 0}}>
                    {diffArr.map((part, idx) => {
                        let style = {};
                        if (part.added) style = {background: '#e6ffe6', color: '#228B22'};
                        else if (part.removed) style = {background: '#ffecec', color: '#d32f2f'};
                        return <span key={idx} style={style}>{part.value}</span>;
                    })}
                </pre>
            </div>
        );
    };

    const [hoverIdx, setHoverIdx] = useState<number|null>(null);
    const renderHistroy = () => {
        if (!projHisPage.data || projHisPage.data.length === 0) {
            return;
        }
        const tagList: JSX.Element[] = [];
        projHisPage.data.forEach((item: ProjHisotry, idx: number) => {
            tagList.push(
                <div
                    key={item.id}
                    className={styles.hiscard}
                    style={hoverIdx === idx ? cardHoverStyle : cardStyle}
                    onMouseEnter={() => setHoverIdx(idx)}
                    onMouseLeave={() => setHoverIdx(null)}
                >
                    <div style={infoRowStyle}>
                        <span style={fileNameStyle}>{t("label_file_name")}：{item.name}</span>
                        <span style={timeStyle}>{t("label_time")}：{dayjs(item.updated_time).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </div>
                    <div id="hisdiff">{renderDiff(item.diff)}</div>
                    <div className={styles.footer} style={{marginTop: 10}}>
                        <div style={btnGroupStyle}>
                            <button className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#projHistoryDetail"
                                onClick={() => { getHistoryDetail(item.id) }}
                                style={{fontSize: '13px', padding: '4px 16px'}}
                            >{t("btn_detail")}</button>
                            <button className="btn btn-outline-primary" onClick={() => { restoreProjHistories(item.id) }} style={{fontSize: '13px', padding: '4px 16px'}}>{t("btn_restore")}</button>
                        </div>
                    </div>
                    <ProjHistoryDetail projectId={props.projectId}></ProjHistoryDetail>
                </div>
            );
        });
        return tagList;
    }

    return (
        <div>
            <div className="offcanvas offcanvas-end" tab-index="-1" id="projHistory" aria-labelledby="offcanvasExampleLabel">
                <div className="offcanvas-header">
                    <h6 className="offcanvas-title" id="projHistoryLabel">{t("title_history")}</h6>
                    <button type="button"
                        className="btn-close text-reset"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div className={styles.divline}></div>
                    {renderHistroy()}
                </div>
            </div>
            <ProjHistoryDetail projectId={props.projectId}></ProjHistoryDetail>
        </div>
    );
}

export default ProjHistory;