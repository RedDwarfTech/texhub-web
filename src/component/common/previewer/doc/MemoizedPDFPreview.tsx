import React, { CSSProperties, useRef, useState } from "react";
import { Document } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback, Options } from "react-pdf/dist/cjs/shared/types";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import { readConfig } from "@/config/app/config-reader";
import { scrollToPage } from "./PDFPreviewHandle";
import { ListOnScrollProps, VariableSizeList } from "react-window";
import { asyncMap } from "@wojtekmaj/async-array-utils";
import TeXPDFPage from "./TeXPDFPage";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import {
  getCurPdfScrollOffset,
  setCurPdfPage,
  setCurPdfScrollOffset,
} from "@/service/project/preview/PreviewService";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";

interface PDFPreviewProps {
  curPdfUrl: string;
  projId: string;
  options: Options;
  viewModel: string;
  setPageNum: (page: number) => void;
  virtualListRef: React.RefObject<VariableSizeList>;
}

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(
  ({
    curPdfUrl,
    projId,
    options,
    viewModel = "default",
    setPageNum,
    virtualListRef,
  }) => {
    let pdfScaleKey = "pdf:scale:" + projId;
    let cachedScale = Number(localStorage.getItem(pdfScaleKey));
    const { pdfFocus } = useSelector((state: AppState) => state.proj);
    const [pdf, setPdf] = useState<DocumentCallback>();
    const [pageViewports, setPageViewports] = useState<any>();
    const divRef = useRef<HTMLDivElement>(null);
    const { projAttr } = useSelector((state: AppState) => state.proj);
    const [projAttribute, setProjAttribute] = useState<ProjAttribute>({
      pdfScale: cachedScale,
      legacyPdfScale: cachedScale,
    });

    React.useEffect(() => {
      const handleResize = () => {};

      const resizeObserver = new ResizeObserver(handleResize);

      if (divRef.current) {
        resizeObserver.observe(divRef.current);
      }

      // Cleanup observer on component unmount
      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    React.useEffect(() => {
      if (projAttr.pdfScale === 1 && cachedScale) {
        return;
      }
      setProjAttribute(projAttr);
    }, [projAttr, cachedScale]);

    React.useEffect(() => {
      setPageViewports(undefined);

      if (!pdf) {
        return;
      }

      (async () => {
        const pageNumbers = Array.from(new Array(pdf.numPages)).map(
          (_, index) => index + 1
        );

        const nextPageViewports = await asyncMap(
          pageNumbers,
          (pageNumber: number) =>
            pdf
              .getPage(pageNumber)
              .then((page) => page.getViewport({ scale: 1 }))
        );
        setPageViewports(nextPageViewports);
      })();
    }, [pdf]);

    React.useEffect(() => {
      if (pdfFocus && pdfFocus.length > 0) {
        let pageNum = pdfFocus[0].page;
        setCurPdfPage(pageNum, projId);
        scrollToPage(pageNum, virtualListRef);
      }
    }, [pdfFocus]);

    const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
      const { numPages } = pdf;
      setPageNum(numPages);
      setPdf(pdf);
    };

    const getDynStyles = (viewModel: string) => {
      switch (viewModel) {
        case "default":
          return styles.previewBody;
        case "fullscreen":
          return styles.previewFsBody;
        default:
          return styles.previewBody;
      }
    };

    const handlePdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const key = readConfig("pdfScrollKey") + projId;
      localStorage.setItem(key, scrollTop.toString());
    };

    const handleWindowPdfScroll = (e: ListOnScrollProps) => {
      const scrollOffset = e.scrollOffset;
      setCurPdfScrollOffset(scrollOffset, projId);
    };

    const getInitialScrollOffset = () => {
      let offset = getCurPdfScrollOffset(projId);
      return offset;
    };

    const getPageHeight = (pageIndex: number, width: number) => {
      if (!pageViewports) {
        throw new Error("getPageHeight() called too early");
      }
      const pageViewport = pageViewports[pageIndex];
      const scale = width / pageViewport.width;
      const actualHeight = pageViewport.height * scale;
      return actualHeight;
    };

    /**
     * Open pdf's link in the browser new tab
     * https://github.com/diegomura/react-pdf/issues/645
     * @param e
     */
    const openPdfUrlLink = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if ((e.target as HTMLElement).tagName.toLowerCase() === "a") {
        window.open((e.target as HTMLAnchorElement).href);
      }
    };

    /**
     * https://codesandbox.io/p/sandbox/react-pdf-react-window-forked-rcw56x?file=%2Fsrc%2FApp.js%3A81%2C35
     *
     * @returns
     */
    const renderPdfList = () => {
      if (pdf && pageViewports) {
        return (
          <AutoSizer onResize={onResize}>
            {({ width, height }: { width: number; height: number }) => (
              <VariableSizeList
                ref={virtualListRef}
                width={width}
                height={height * pdf.numPages}
                estimatedItemSize={50}
                initialScrollOffset={getInitialScrollOffset()}
                itemCount={pdf.numPages}
                overscanCount={0}
                onScroll={(e: ListOnScrollProps) => handleWindowPdfScroll(e)}
                itemSize={(pageIndex) => getPageHeight(pageIndex, width)}
              >
                {({
                  index,
                  style,
                }: {
                  index: number;
                  style: React.CSSProperties;
                }) => (
                    <TeXPDFPage
                      index={index + 1}
                      width={width}
                      style={style}
                      projId={projId}
                    />
                )}
              </VariableSizeList>
            )}
          </AutoSizer>
        );
      } else {
        return <div>loading...</div>;
      }
    };

    const onResize = (size: Size) => {
      console.log('Width:', size);

    };

    return (
      <Document
        options={options}
        file={curPdfUrl!}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <div
          id="pdfContainer"
          ref={divRef}
          // className={getDynStyles(viewModel)}
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flex: 1,
            backgroundColor: "#ededed"
          }}
          onClick={openPdfUrlLink}
        >
          {renderPdfList()}
        </div>
      </Document>
    );
  },
  (prevProps, nextProps) => {
    let arePropsEqual = prevProps.curPdfUrl === nextProps.curPdfUrl;
    return arePropsEqual;
  }
);

export default MemoizedPDFPreview;
