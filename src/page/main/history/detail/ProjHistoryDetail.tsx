import { useSelector } from "react-redux";
import styles from "./ProjHistoryDetail.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useRef, useState } from "react";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { getProjHistory, projHistoryPage, replaceTextToEditor } from "@/service/project/ProjectService";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import dayjs from "dayjs";
import { QueryHistoryDetail } from "@/model/request/proj/query/QueryHistoryDetail";
import { ResponseHandler } from "rdjs-wheel";
import * as Y from 'yjs';
import OmsSyntaxHighlight from "./OmsSyntaxHighlight";

export type HistoryProps = {
    projectId: string;
};

const ProjHistoryDetail: React.FC<HistoryProps> = (props: HistoryProps) => {

    const { projHisPage, curYDoc } = useSelector((state: AppState) => state.proj);
    const [histories, setHistories] = useState<ProjHisotry[]>([]);
    const [curDoc, setCurDoc] = useState<Y.Doc>();
    const delProjCancelRef = useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (curYDoc) {
            setCurDoc(curYDoc);
        }
    }, [curYDoc]);

    React.useEffect(() => {
        if (projHisPage && projHisPage.data) {
            setHistories(projHisPage.data);
        }
    }, [projHisPage]);

    const getProjHistories = () => {
        const hist: QueryHistory = {
            project_id: props.projectId
        };
        projHistoryPage(hist);
    }

    const base64ToUint8Array = (base64: string): Uint8Array => {
        const binaryString = atob(base64);
        const length = binaryString.length;
        const uint8Array = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }

        return uint8Array;
    }

    const restoreProjHistories = (snapId: number) => {
        const hist: QueryHistoryDetail = {
            id: snapId
        };
        getProjHistory(hist).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                debugger
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

    const renderHistroy = () => {
        if (!histories || histories.length === 0) {
            return;
        }
        const tagList: JSX.Element[] = [];
        histories.forEach((item: ProjHisotry) => {
            tagList.push(
                <div key={item.id} className={styles.hiscard}>
                    <div>{item.name}</div>
                    <div>时间：{dayjs(item.updated_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                    <div className={styles.footer}>
                        <div>
                            <button className="btn btn-primary" onClick={() => { getProjHistories() }}>详情</button>
                        </div>
                        <div>
                            <button className="btn btn-primary" onClick={() => { restoreProjHistories(item.id) }}>还原</button>
                        </div>
                    </div>
                </div>
            );
        });
        return tagList;
    }

    return (
        <div className="modal" id="projHistoryDetail" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">版本详情</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <React.Suspense fallback={<div>Loading...</div>}>
                            <OmsSyntaxHighlight
                                textContent={curDoc?.getText().toString()!}
                                language={"tex"} />
                        </React.Suspense>
                    </div>
                    <div className="modal-footer">
                        <button type="button" ref={delProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjHistoryDetail;