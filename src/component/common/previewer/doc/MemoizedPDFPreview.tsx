import React, { useRef, useState } from "react";
import { Document } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback } from "react-pdf/dist/cjs/shared/types";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import { readConfig } from "@/config/app/config-reader";
import { openPdfUrlLink, scrollToPage } from "./PDFPreviewHandle";
import { ListOnScrollProps, VariableSizeList } from "react-window";
import { asyncMap } from "@wojtekmaj/async-array-utils";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { PDFPreviewProps } from "@/model/props/proj/pdf/PDFPreviewProps";
import {
  getCurPdfPage,
  getCurPdfScrollOffset,
  setCurPdfPage,
  setCurPdfScrollOffset,
} from "@/service/project/preview/PreviewService";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";
import TeXPDFPage from "./TeXPDFPage";

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
    let cachedPdfOffset = getCurPdfScrollOffset(projId);
    const { pdfFocus } = useSelector((state: AppState) => state.proj);
    const [pdf, setPdf] = useState<DocumentCallback>();
    const [pageViewports, setPageViewports] = useState<any>();
    const divRef = useRef<HTMLDivElement>(null);
    const { projAttr } = useSelector((state: AppState) => state.proj);
    const [projAttribute, setProjAttribute] = useState<ProjAttribute>({
      pdfScale: cachedScale,
      legacyPdfScale: cachedScale,
      pdfOffset: cachedPdfOffset,
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
      if (virtualListRef.current) {
        virtualListRef.current.resetAfterIndex(0, true);
      }
      setCurPdfScrollOffset(projAttr.pdfOffset, projId);
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
              .then((page) =>
                page.getViewport({ scale: projAttr.pdfScale || 1 })
              )
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

    const handleWindowPdfScroll = (e: ListOnScrollProps) => {
      const scrollOffset = e.scrollOffset;
      setCurPdfScrollOffset(scrollOffset, projId);
    };

    const getPageHeight = (pageIndex: number, width: number) => {
      if (!pageViewports) {
        throw new Error("getPageHeight() called too early");
      }
      const pageViewport = pageViewports[pageIndex];
      const scale = width / pageViewport.width;
      // we need to change the height of the pdf page when scale
      // the pdf content will override each other when scale the page
      const actualHeight = pageViewport.height * scale * projAttribute.pdfScale;
      console.log(
        "actual height:" +
          actualHeight +
          ",width:" +
          width +
          ", pageIndex:" +
          pageIndex +
          ",pdfScale:" +
          projAttribute.pdfScale
      );
      // margin 10px for each pdf pages
      return actualHeight + 10;
    };

    const getOffset = (height: number) => {
      let page = projAttribute.pdfOffset;
      return page;
    };

    /**
     * https://codesandbox.io/p/sandbox/react-pdf-react-window-forked-rcw56x?file=%2Fsrc%2FApp.js%3A81%2C35
     *
     * @returns
     */
    const renderPdfList = (width: number, height: number) => {
      if (pdf && pageViewports) {
        return (
          <VariableSizeList
            ref={virtualListRef}
            width={width}
            height={height}
            estimatedItemSize={500}
            initialScrollOffset={getOffset(height)}
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
            }) => {
              return (
                <TeXPDFPage
                  index={index + 1}
                  width={width}
                  style={style}
                  projId={projId}
                />
              );
            }}
          </VariableSizeList>
        );
      }
    };

    const onResize = (size: Size) => {
      if (virtualListRef.current) {
      }
    };

    return (
      <AutoSizer onResize={onResize}>
        {({ width, height }: { width: number; height: number }) => (
          <Document
            options={options}
            file={curPdfUrl!}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <div
              id="pdfContainer"
              ref={divRef}
              className={getDynStyles(viewModel)}
              style={{
                height: "100vh",
                // do not setting the width to make it auto fit
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                flex: 1,
                backgroundColor: "#ededed",
              }}
              onClick={openPdfUrlLink}
            >
              {renderPdfList(width, height)}
            </div>
          </Document>
        )}
      </AutoSizer>
    );
  },
  (prevProps, nextProps) => {
    let arePropsEqual = prevProps.curPdfUrl === nextProps.curPdfUrl;
    return arePropsEqual;
  }
);

export default MemoizedPDFPreview;
