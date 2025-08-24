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
import {
  projHistoryPage,
  setHistoryVersionFile,
} from "@/service/project/ProjectService";
import { dispathAction } from "@/service/common/CommonService.js";
import {
  defaultHistoryItemHeight,
  defaultHistoryPageSize,
} from "@/config/app/global-conf.js";
import { TexFileModel } from "@/model/file/TexFileModel.js";

export type HistoryProps = {
  projectId: string;
};

const ProjHistory: React.FC<HistoryProps> = (props: HistoryProps) => {
  const { projHisPage } = useSelector((state: AppState) => state.proj);
  const { curHistoryFile } = useSelector((state: AppState) => state.projTree);
  const { t } = useTranslation();
  const virtualListRef = React.useRef<VariableSizeList>(null);
  const [historyList, setHistoryList] = useState<ProjHisotry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sizeMap = useRef(new Map<string, number>());
  const getItemSize = (index: number) => {
    if (index >= historyList.length) return defaultHistoryItemHeight;
    const item = historyList[index];
    if (!item) return defaultHistoryItemHeight;
    const heightNew = sizeMap.current.get(item.id);
    return heightNew || defaultHistoryItemHeight;
  };
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResetIndex = useRef<number | null>(null);

  React.useEffect(() => {
    var myOffcanvas = document.getElementById("projHistory");
    if (myOffcanvas) {
      myOffcanvas.addEventListener("hidden.bs.offcanvas", function () {
        dispathAction("PROJ_HISTORY_PAGE", []);
        setHistoryList([]);
        sizeMap.current.clear();
      });
    }
    return () => {
      dispathAction("PROJ_HISTORY_PAGE", []);
      setHistoryList([]);
      sizeMap.current.clear();
    };
  }, []);

  React.useEffect(() => {
    if (projHisPage?.data && projHisPage?.data?.length) {
      if (projHisPage.data.length === 0) {
        setHasMore(false);
        return;
      }
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
        page_size: defaultHistoryPageSize,
        file_int_id: curHistoryFile?.id || "",
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

  function mergeRefs(...refs: any[]) {
    return (instance: any) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === "function") {
          ref(instance);
        } else {
          ref.current = instance;
        }
      });
    };
  }

  const onSizeMeasured = (index: number, height: number) => {
    const offcanvas = document.getElementById("projHistory");
    if (!offcanvas || !offcanvas.classList.contains("show")) {
      return;
    }

    if (index >= historyList.length) return;
    const item = historyList[index];
    if (!item) return;

    const prevHeight = sizeMap.current.get(item.id);

    if (prevHeight !== height) {
      sizeMap.current.set(item.id, height);

      if (pendingResetIndex.current === null) {
        pendingResetIndex.current = index;
      } else {
        pendingResetIndex.current = Math.min(pendingResetIndex.current, index);
      }

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        if (pendingResetIndex.current !== null) {
          virtualListRef.current?.resetAfterIndex(
            pendingResetIndex.current,
            true
          );
          pendingResetIndex.current = null;
        }
      }, 500);
    }
  };

  const MemorizedRow = React.memo(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (index >= historyList.length || !historyList[index]) {
        return <div style={style} />;
      }

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
    },
    (prevProps, nextProps) => {
      return (
        prevProps.index === nextProps.index &&
        prevProps.style.height === nextProps.style.height &&
        prevProps.style.top === nextProps.style.top
      );
    }
  );

  const renderList = (width: number, height: number) => {
    console.log(historyList.length);
    return (
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={hasMore ? historyList.length + 1 : historyList.length}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <VariableSizeList
            key={"projHistoryScrollList"}
            ref={mergeRefs(ref, virtualListRef)}
            width={width}
            height={height}
            estimatedItemSize={defaultHistoryItemHeight}
            itemCount={historyList.length}
            overscanCount={3}
            onScroll={(e: ListOnScrollProps) => handleWindowPdfScroll(e)}
            itemSize={(pageIndex) => {
              return getItemSize(pageIndex);
            }}
            onItemsRendered={(props: ListOnItemsRenderedProps) => {
              onItemsRendered(props);
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

  const backToDefaultHistory = () => {
    setHistoryVersionFile({} as TexFileModel);
  };

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
          {curHistoryFile && Object.keys(curHistoryFile).length > 0 ? (
            <div>
              <i
                className="fa-solid fa-arrow-left"
                onClick={() => backToDefaultHistory()}
              ></i>
            </div>
          ) : null}
          {historyListComponent()}
        </div>
      </div>
      <ProjHistoryDetail projectId={props.projectId}></ProjHistoryDetail>
    </div>
  );
};

export default ProjHistory;
