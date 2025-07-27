import { useSelector } from "react-redux";
import styles from "./ProjHistory.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ProjHistoryDetail from "./detail/ProjHistoryDetail";
import { FixedSizeList, ListOnItemsRenderedProps, ListOnScrollProps, VariableSizeList } from "react-window";
import HistoryItem from "./item/HistoryItem";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import List from "react-window-infinite-loader";

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

    const loadMoreItems = (startIndex: number, stopIndex: number) => {

    }

    // Render an item or a loading indicator.
    const Item = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        let content;
        if (!isItemLoaded(index)) {
            content = "Loading...";
        } else {
            if (!projHisPage || !projHisPage.data || projHisPage.data.length === 0) {
                return null;
            }
            content = projHisPage.data[index].name;
        }

        return <div style={style}>{content}</div>;
    };

    const isItemLoaded = (index: number) => {
        if (!projHisPage || !projHisPage.data || projHisPage.data.length === 0) {
            return false;
        }
        return index < projHisPage!.data!.length;
    };

    const renderElement = (index: number, style: React.CSSProperties) => {
        if (!projHisPage || !projHisPage.data || projHisPage.data.length === 0) {
            return null;
        }
        if (projHisPage.data[index] === undefined) {
            return null;
        }
        return (<div style={style}>
            {<HistoryItem item={projHisPage!.data![index]} projectId={props.projectId} idx={index} />}
        </div>);
    }

    const renderScrollList = (width: number, height: number) => (
        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={100}
            loadMoreItems={loadMoreItems}
        >
            {({ onItemsRendered, ref }) => (
                <VariableSizeList
                    height={height}
                    width={width}
                    itemCount={100}
                    itemSize={(pageIndex) => { return 100 }}
                    //itemSize={180}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    {...props}
                >
                    {({ index, style }) => (
                        renderElement(index, style)
                    )}
                </VariableSizeList>
            )}
        </InfiniteLoader>
    );

    const renderList = (width: number, height: number) => {
        return (
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={100}
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
                    // do not setting the width to make it auto fit
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