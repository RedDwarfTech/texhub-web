import { useSelector } from "react-redux";
import styles from "./ProjHistory.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProjHistoryDetail from "./detail/ProjHistoryDetail";
import {
  ListOnItemsRenderedProps,
  ListOnScrollProps,
  VariableSizeList,
} from "react-window";
import HistoryItem from "./item/HistoryItem";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import { projHistoryPage } from "@/service/project/ProjectService";
import { off } from "process";

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
  const debounceTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  React.useEffect(() => {
    return () => {
      setHistoryList([]);
    };
  }, []);

  React.useEffect(() => {
    if (
      projHisPage?.data &&
      projHisPage?.data?.length &&
      projHisPage?.data?.length > 0
    ) {
      setHistoryList((prev) => {
        const ids = new Set(prev.map((item) => item.id));
        const newItems = projHisPage!.data!.filter((item) => !ids.has(item.id));
        return [...prev, ...newItems];
      });
    }
  }, [projHisPage]);

  const handleWindowPdfScroll = (e: ListOnScrollProps) => {
    const scrollOffset = e.scrollOffset;
  };

  const onResize = (size: Size) => {};

  const getMinIdItem = () => {
    if (historyList.length === 0) return null;

    return historyList.reduce((minItem, currentItem) => {
      const currentId = BigInt(currentItem.id);
      const minId = BigInt(minItem.id);
      return currentId < minId ? currentItem : minItem;
    });
  };

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const minId = getMinIdItem()?.id || null;
      const hist: QueryHistory = {
        project_id: props.projectId,
        offset: minId,
        page_size: 5,
      };
      await projHistoryPage(hist);
    } finally {
      loadingRef.current = false;
    }
  };

  const isItemLoaded = (index: number) => {
    if (!historyList || historyList.length === 0) {
      return false;
    }
    return index < historyList.length;
  };

  const onSizeMeasured = (index: number, height: number) => {
    const prevHeight = sizeMap.current.get(index);

    if (prevHeight !== height) {
      sizeMap.current.set(index, height);

      const existingTimer = debounceTimers.current.get(index);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        virtualListRef.current?.resetAfterIndex(index, true);
        debounceTimers.current.delete(index);
      }, 100);

      debounceTimers.current.set(index, timer);
    }
  };

  const MemorizedRow = React.memo(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      return (
        <div style={style}>
          <HistoryItem
            item={historyList[index]}
            projectId={props.projectId}
            idx={index}
            onSizeMeasured={onSizeMeasured}
          />
        </div>
      );
    }
  );

  const onItemsRenderedImpl = ({
    visibleStartIndex,
    visibleStopIndex,
  }: ListOnItemsRenderedProps) => {
    // 如果可见区域的最后一项是最后一项，则加载更多
    if (visibleStopIndex === historyList.length - 1) {
      console.log("Loading more items...historyList:", historyList.length);
      loadMoreItems(visibleStopIndex, visibleStopIndex + 1);
    }
  };

  const renderList = (width: number, height: number) => {
    return (
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={historyList.length}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <VariableSizeList
            key={"projHistoryScrollList"}
            ref={ref}
            width={width}
            height={height}
            estimatedItemSize={500}
            itemCount={historyList.length}
            overscanCount={5}
            onScroll={(e: ListOnScrollProps) => handleWindowPdfScroll(e)}
            itemSize={(pageIndex) => {
              return getItemSize(pageIndex);
            }}
            onItemsRendered={(props: ListOnItemsRenderedProps) => {
              onItemsRenderedImpl(props);
            }}
          >
            {({
              index,
              style,
            }: {
              index: number;
              style: React.CSSProperties;
            }) => {
              return <MemorizedRow index={index} style={style} />;
            }}
          </VariableSizeList>
        )}
      </InfiniteLoader>
    );
  };

  const historyListComponent = () => (
    <AutoSizer onResize={onResize}>
      {({ width, height }: { width: number; height: number }) => (
        <div
          style={{
            height: "100vh",
            width: width + 10,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
            flex: 1,
          }}
        >
          {renderList(width, height)}
        </div>
      )}
    </AutoSizer>
  );

  return (
    <div>
      <div
        className="offcanvas offcanvas-end"
        tab-index="-1"
        id="projHistory"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h6 className="offcanvas-title" id="projHistoryLabel">
            {t("title_history")}
          </h6>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className={`offcanvas-body ${styles.offcanvasOverride}`}>
          {historyListComponent()}
        </div>
      </div>
      <ProjHistoryDetail projectId={props.projectId}></ProjHistoryDetail>
    </div>
  );
};

export default ProjHistory;
