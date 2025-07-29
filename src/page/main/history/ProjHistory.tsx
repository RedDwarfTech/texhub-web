import { useSelector } from "react-redux";
import styles from "./ProjHistory.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProjHistoryDetail from "./detail/ProjHistoryDetail";
import { FixedSizeList, ListOnItemsRenderedProps, ListOnScrollProps, VariableSizeList } from "react-window";
import HistoryItem from "./item/HistoryItem";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import List from "react-window-infinite-loader";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import { projHistoryPage } from "@/service/project/ProjectService";

export type HistoryProps = {
    projectId: string;
};

const ProjHistory: React.FC<HistoryProps> = (props: HistoryProps) => {

    const { projHisPage } = useSelector((state: AppState) => state.proj);
    const { t } = useTranslation();
    const virtualListRef = React.useRef<VariableSizeList>(null);
    const [historyList, setHistoryList] = useState<ProjHisotry[]>([]);
    const loadingRef = useRef(false);
    const sizeMap = useRef(new Map<number, number>());
    const getItemSize = (index: number) => sizeMap.current.get(index) || 200;

    React.useEffect(() => {
        if (projHisPage?.data && projHisPage?.data?.length && projHisPage?.data?.length > 0) {
            setHistoryList(prev => [...prev, ...projHisPage.data || []]);
        }
    }, [projHisPage]);

    const handleWindowPdfScroll = (e: ListOnScrollProps) => {
        const scrollOffset = e.scrollOffset;
    };

    const onResize = (size: Size) => { };

    // 获取 id 最小的元素
    const getMinIdItem = () => {
        if (historyList.length === 0) return null;

        // 使用 BigInt 进行比较（适用于超大整数）
        return historyList.reduce((minItem, currentItem) => {
            const currentId = BigInt(currentItem.id);
            const minId = BigInt(minItem.id);
            return currentId < minId ? currentItem : minItem;
        });
    };

    const loadMoreItems = (startIndex: number, stopIndex: number) => {
        debugger
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            const minId = getMinIdItem()?.id || null;
            const hist: QueryHistory = {
                project_id: props.projectId,
                offset: minId,
            };
            projHistoryPage(hist);
        } finally {
            loadingRef.current = false;
        }
    }

    const isItemLoaded = (index: number) => {
        if (!historyList || historyList.length === 0) {
            return false;
        }
        return index < historyList.length;
    };

    const onSizeMeasured = (index: number, height: number) => {
        if (sizeMap.current.get(index) !== height) {
            sizeMap.current.set(index, height);
            virtualListRef.current?.resetAfterIndex(index);
        }
    };

    const renderElement = (index: number, style: React.CSSProperties) => {
        if (!historyList || historyList.length === 0) {
            return null;
        }
        if (historyList[index] === undefined) {
            return null;
        }
        return (<div>
            {<HistoryItem item={historyList[index]}
                projectId={props.projectId}
                onSizeMeasured={(h) => onSizeMeasured(index, h)}
                idx={index} />}
        </div>);
    }

    const renderList = (width: number, height: number) => {
        return (
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={10}
                loadMoreItems={loadMoreItems}
            >
                {({ onItemsRendered, ref }) => (
                    <VariableSizeList
                        key={"projHistoryScrollList"}
                        ref={virtualListRef}
                        width={width}
                        height={height}
                        estimatedItemSize={500}
                        itemCount={10}
                        overscanCount={5}
                        onScroll={(e: ListOnScrollProps) => handleWindowPdfScroll(e)}
                        itemSize={(pageIndex) => { return getItemSize(pageIndex) }}
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
                            return renderElement(index, style);
                        }}
                    </VariableSizeList>
                )}
            </InfiniteLoader>
        );
    }

    const historyListComponent = () => (
        <AutoSizer onResize={onResize}>
            {({ width, height }: { width: number; height: number }) => (
                <div style={{
                    height: "100vh",
                    width: width + 10,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    backgroundColor: "#f5f5f5",
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
                <div className={`offcanvas-body ${styles.offcanvasOverride}`}>
                    {historyListComponent()}
                </div>
            </div>
            <ProjHistoryDetail projectId={props.projectId}></ProjHistoryDetail>
        </div>
    );
}

export default ProjHistory;