import { useSelector } from "react-redux";
import styles from "./ProjHistory.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { projHistory } from "@/service/project/ProjectService";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import dayjs from "dayjs";

export type HistoryProps = {
    projectId: string;
};

const ProjHistory: React.FC<HistoryProps> = (props: HistoryProps) => {
    
    const { projHistories } = useSelector((state: AppState) => state.proj);
    const [histories, setHistories] = useState<ProjHisotry[]>([]);

    React.useEffect(()=>{
        const hist: QueryHistory = {
            project_id: props.projectId
        };
        projHistory(hist);
    },[]);

    React.useEffect(()=>{
        if(projHistories && projHistories.length > 0) {
            setHistories(projHistories);
        }
    },[projHistories]);

    const renderHistroy = () => {
        if(!histories || histories.length === 0){
            return;
        }
        const tagList: JSX.Element[] = [];
        histories.forEach((item: ProjHisotry) => {
            tagList.push(
                <div className={styles.hiscard}>
                    <div>{item.name}</div>
                    <div>时间：{dayjs(item.updated_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                    <div className={styles.footer}>
                        <div><button>详情</button></div>
                        <div><button>还原</button></div>
                    </div>
                </div>
            );
        });
        return tagList;
    }

    return (
        <div className="offcanvas offcanvas-end" tab-index="-1" id="projHistory" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h6 className="offcanvas-title" id="projHistoryLabel">项目历史</h6>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className={styles.divline}></div>
                {renderHistroy()}
            </div>
        </div>
    );
}

export default ProjHistory;