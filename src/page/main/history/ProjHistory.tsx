import { useSelector } from "react-redux";
import styles from "./ProjHistory.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ProjHistoryDetail from "./detail/ProjHistoryDetail";
import { ListOnItemsRenderedProps, ListOnScrollProps, VariableSizeList } from "react-window";
import HistoryItem from "./item/HistoryItem";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";

export type HistoryProps = {
    projectId: string;
};

const ProjHistory: React.FC<HistoryProps> = (props: HistoryProps) => {

    const { projHisPage } = useSelector((state: AppState) => state.proj);
    const { t } = useTranslation();
    const virtualListRef = React.useRef<VariableSizeList>(null);

    const handleWindowPdfScroll = (e: ListOnScrollProps) => {
        const scrollOffset = e.scrollOffset;
    };

    const onResize = (size: Size) => { };

    const renderList = (width: number, height: number) => {
        return (<VariableSizeList
            key={"projHistoryScrollList"}
            ref={virtualListRef}
            width={width}
            height={height}
            estimatedItemSize={500}
            itemCount={10}
            overscanCount={0}
            onScroll={(e: ListOnScrollProps) => handleWindowPdfScroll(e)}
            itemSize={(pageIndex) => { return 100 }}
            onItemsRendered={(props: ListOnItemsRenderedProps) => {

            }}
        >
            {({
                index,
                style,
            }: {
                index: number;
                style: React.CSSProperties;
            }) => {
                if (!projHisPage || !projHisPage.data || projHisPage.data.length === 0) {
                    return null;
                }
                return (
                    <HistoryItem item={projHisPage.data[index]} projectId={props.projectId} idx={index} />
                );
            }}
        </VariableSizeList>);
    }

    const historyListComponent = () => (
        <AutoSizer onResize={onResize}>
            {({ width, height }: { width: number; height: number }) => (
                <div style={{
                    height: "100vh",
                    // do not setting the width to make it auto fit
                    width: "21vw",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    flex: 1
                }}>
                    {renderList(width, height)}
                </div>
            )}
        </AutoSizer>
    );

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
                    {historyListComponent()}
                </div>
            </div>
            <ProjHistoryDetail projectId={props.projectId}></ProjHistoryDetail>
        </div>
    );
}

export default ProjHistory;