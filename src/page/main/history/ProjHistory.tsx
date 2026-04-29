import { useSelector } from "react-redux";
import styles from "./ProjHistory.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProjHistoryDetail from "./detail/ProjHistoryDetail";
import {
  List,
  ListImperativeAPI,
  RowComponentProps,
  useDynamicRowHeight,
} from "react-window";
import HistoryItem from "./item/HistoryItem";
import { AutoSizer, Size } from "react-virtualized-auto-sizer";
import { useInfiniteLoader } from "react-window-infinite-loader";
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

type HistoryRowProps = {
  historyList: ProjHisotry[];
  projectId: string;
  onSizeMeasured: (index: number, height: number) => void;
};

const ProjHistory: React.FC<HistoryProps> = (props: HistoryProps) => {
  const { projHisPage } = useSelector((state: AppState) => state.proj);
  const { curHistoryFile } = useSelector((state: AppState) => state.projTree);
  const { t } = useTranslation();
  const virtualListRef = useRef<ListImperativeAPI | null>(null);
  const [historyList, setHistoryList] = useState<ProjHisotry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const dynamicRowHeight = useDynamicRowHeight({
    defaultRowHeight: defaultHistoryItemHeight,
  });

  React.useEffect(() => {
    var myOffcanvas = document.getElementById("projHistory");
    if (myOffcanvas) {
      myOffcanvas.addEventListener("hidden.bs.offcanvas", function () {
        dispathAction("PROJ_HISTORY_PAGE", []);
        setHistoryList([]);
      });
    }
    return () => {
      dispathAction("PROJ_HISTORY_PAGE", []);
      setHistoryList([]);
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

  const handleWindowPdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollOffset = e.currentTarget.scrollTop;
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

  const onSizeMeasured = (index: number, height: number) => {
    const offcanvas = document.getElementById("projHistory");
    if (!offcanvas || !offcanvas.classList.contains("show")) {
      return;
    }

    if (index >= historyList.length) return;
    const prevHeight = dynamicRowHeight.getRowHeight(index);
    if (prevHeight !== height) {
      dynamicRowHeight.setRowHeight(index, height);
    }
  };

  const Row = ({
    index,
    style,
    historyList,
    projectId,
    onSizeMeasured,
  }: RowComponentProps<HistoryRowProps>) => {
    if (index >= historyList.length || !historyList[index]) {
      return <div style={style} />;
    }

    return (
      <div style={style}>
        <HistoryItem
          item={historyList[index]}
          projectId={projectId}
          idx={index}
          onSizeMeasured={onSizeMeasured}
        />
      </div>
    );
  };

  const onRowsRendered = useInfiniteLoader({
    isRowLoaded: isItemLoaded,
    loadMoreRows: loadMoreItems,
    rowCount: hasMore ? historyList.length + 1 : historyList.length,
  });

  const renderList = (width: number, height: number) => {
    return (
      <List
        key={"projHistoryScrollList"}
        listRef={virtualListRef}
        rowCount={hasMore ? historyList.length + 1 : historyList.length}
        rowHeight={dynamicRowHeight}
        rowComponent={Row}
        rowProps={{
          historyList,
          projectId: props.projectId,
          onSizeMeasured,
        }}
        overscanCount={3}
        onScroll={handleWindowPdfScroll}
        onRowsRendered={onRowsRendered}
        style={{ width, height }}
      />
    );
  };

  const historyListComponent = () => (
    <AutoSizer
      onResize={onResize}
      renderProp={({ width, height }: { width: number | undefined; height: number | undefined }) => (
        <div
          style={{
            height: "100vh",
            width: (width || 0) + 10,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
            flex: 1,
          }}
        >
          {renderList(width || 0, height || 0)}
        </div>
      )}
    />
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
