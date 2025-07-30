import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { QueryHistoryDetail } from "@/model/request/proj/query/QueryHistoryDetail";
import { AppState } from "@/redux/types/AppState";
import { getProjHistoryDetail, replaceTextToEditor } from "@/service/project/ProjectService";
import { EntityList, ResponseHandler } from "rdjs-wheel";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import styles from "./HistoryItem.module.css";
import ProjHistoryDetail from "../detail/ProjHistoryDetail";
import dayjs from "dayjs";
import React from "react";

export type HistoryItemProps = {
    item: ProjHisotry,
    projectId: string;
    idx: number;
    onSizeMeasured: (index: number, height: number) => void;
};

const HistoryItem: React.FC<HistoryItemProps> = (props: HistoryItemProps) => {

    const { t } = useTranslation();
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (containerRef.current && props.onSizeMeasured) {
            const observer = new ResizeObserver((entries) => {
                const height = entries[0].contentRect.height;
                props.onSizeMeasured(props.idx, height);
            });

            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }
    }, [props.onSizeMeasured, props.idx]);

    const getHistoryDetail = (id: string) => {
        const hist: QueryHistoryDetail = {
            id: id
        };
        getProjHistoryDetail(hist);
    }

    const restoreProjHistories = (snapId: string) => {
        const hist: QueryHistoryDetail = {
            id: snapId
        };
        getProjHistoryDetail(hist).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                let snapshot = resp.result.content;
                replaceTextToEditor(snapshot);
            }
        });
    }

    const renderDiff = (diffStr: string) => {
        if (!diffStr) return null;
        let diffArr: any[] = [];
        try {
            diffArr = JSON.parse(diffStr);
        } catch (e) {
            return <div>diff 解析失败</div>;
        }
        return (
            <div className={styles.diffblock}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', margin: 0, background: 'none', border: 'none', padding: 0 }}>
                    {diffArr.map((part, idx) => {
                        let style = {};
                        if (part.added) style = { background: '#e6ffe6', color: '#228B22' };
                        else if (part.removed) style = { background: '#ffecec', color: '#d32f2f' };

                        const value = String(part.value);
                        const elements: React.ReactNode[] = [];
                        let lastIndex = 0;
                        // 匹配所有换行符
                        value.replace(/\n/g, (match, offset) => {
                            if (offset > lastIndex) {
                                elements.push(
                                    <span key={idx + '-' + lastIndex} style={style}>
                                        {value.slice(lastIndex, offset)}
                                    </span>
                                );
                            }
                            elements.push(
                                <span key={idx + '-nl-' + offset} style={{ ...style, color: '#aaa', fontWeight: 'bold' }} title="换行">⏎</span>
                            );
                            lastIndex = offset + 1;
                            return match;
                        });
                        if (lastIndex < value.length) {
                            elements.push(
                                <span key={idx + '-end'} style={style}>
                                    {value.slice(lastIndex)}
                                </span>
                            );
                        }
                        // 如果没有换行符，直接渲染
                        if (elements.length === 0) {
                            return <span key={idx} style={style}>{value}</span>;
                        }
                        return elements;
                    })}
                </pre>
            </div>
        );
    };

    const renderHistroyItem = (item: ProjHisotry, idx: number) => {
        return (<div
            key={item.id}
            ref={containerRef}
            className={hoverIdx === idx ? `${styles.hiscard} ${styles['hiscard-hover']}` : styles.hiscard}
            onMouseEnter={() => setHoverIdx(idx)}
            onMouseLeave={() => setHoverIdx(null)}
        >
            <div className={styles.inforow}>
                <div className={styles.filename} title={item.name}>{t("label_file_name")}：{item.name}</div>
                <div className={styles.time}>{t("label_time")}：{dayjs(item.created_time).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
            <div id="hisdiff">{renderDiff(item.diff)}</div>
            <div className={styles.footer} style={{ marginTop: 10 }}>
                <div className={styles.btngroup}>
                    <button className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#projHistoryDetail"
                        onClick={() => { getHistoryDetail(item.id) }}
                        style={{ fontSize: '13px', padding: '4px 16px' }}
                    >{t("btn_detail")}</button>
                    <button className="btn btn-outline-primary" onClick={() => { restoreProjHistories(item.id) }} style={{ fontSize: '13px', padding: '4px 16px' }}>{t("btn_restore")}</button>
                </div>
            </div>
            <ProjHistoryDetail projectId={props.projectId}></ProjHistoryDetail>
        </div>);
    }

    return renderHistroyItem(props.item, props.idx);
}

export default HistoryItem;