import React, { useRef, useState } from "react";
import { Document } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback } from "react-pdf/dist/shared/types";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import {
  isMoreThanFiveSeconds,
  openPdfUrlLink,
  scrollToOffset,
  scrollToPage,
} from "./PDFPreviewHandle";
import {
  ListOnItemsRenderedProps,
  ListOnScrollProps,
  VariableSizeList,
} from "react-window";
import { asyncMap } from "@wojtekmaj/async-array-utils";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { PDFPreviewProps } from "@/model/props/proj/pdf/PDFPreviewProps";
import {
  getCurPdfScale,
  getCurPdfScrollOffset,
  setAndDispatchPdfPage,
  setCurPdfScrollOffset,
  setDocLoadTime,
} from "@/service/project/preview/PreviewService";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import TeXPDFPage from "./TeXPDFPage";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { getAccessToken } from "../../cache/Cache";
import { authTokenEquals, getAuthorization } from "@/config/pdf/PdfJsConfig";
import { getNewScaleOffsetPosition } from "../calc/ScrollUtil";

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(
  ({
    curPdfUrl,
    projId,
    viewModel = "default",
    setPageNum,
    virtualListRef,
    pdfOptions,
    curPdfPage,
  }) => {
    let cachedScale = getCurPdfScale(projId, viewModel);
    const { pdfFocus, projAttr } = useSelector((state: AppState) => state.proj);
    const [pdf, setPdf] = useState<DocumentCallback>();
    const [pageViewports, setPageViewports] = useState<any>();
    const divRef = useRef<HTMLDivElement>(null);
    const [projAttribute, setProjAttribute] = useState<PreviewPdfAttribute>({
      pdfScale: cachedScale,
      legacyPdfScale: cachedScale,
    });
    const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();

    React.useEffect(() => {
      if (projAttr.pdfScale === 1 && cachedScale) {
        return;
      }
      setProjAttribute(projAttr);
      if (virtualListRef.current) {
        virtualListRef.current.resetAfterIndex(0, true);
        let curOffset = getCurPdfScrollOffset(projId);
        let fullScreenOffset = getNewScaleOffsetPosition(
          projAttr.legacyPdfScale,
          projAttr.pdfScale,
          curOffset
        );
        if (fullScreenOffset) {
          console.log("get the newOffset:" + fullScreenOffset);
          setTimeout(() => {
            scrollToOffset(fullScreenOffset, virtualListRef, projId);
          }, 500);
        }
      }
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
        setAndDispatchPdfPage(pageNum, projId, "pdfFocus");
        setCurPdfPosition(pdfFocus);
        if (virtualListRef.current) {
          scrollToPage(pageNum, virtualListRef);
        }
        setTimeout(() => {
          // setCurPdfPosition([]);
        }, 10000);
      }
    }, [pdfFocus]);

    const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
      const { numPages } = pdf;
      setPageNum(numPages);
      setPdf(pdf);
      if (virtualListRef.current) {
        console.log("current list is not null");
      }
      setDocLoadTime();
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
      let docLoadTime = localStorage.getItem("docLoadTime");
      if (docLoadTime && isMoreThanFiveSeconds(docLoadTime)) {
        setCurPdfScrollOffset(
          scrollOffset,
          projId,
          "handleWindowPdfScroll"
        );
      }
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
      // margin 10px for each pdf pages
      return actualHeight + 10;
    };

    /**
     * only work for the first time loading
     *
     * @param projAttribute
     * @returns
     */
    const getInitialOffset = () => {
      let curOffset = getCurPdfScrollOffset(projId);
      return curOffset;
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
            key={"pdfScrollList"}
            ref={virtualListRef}
            width={width}
            height={height}
            estimatedItemSize={500}
            initialScrollOffset={getInitialOffset()}
            itemCount={pdf.numPages}
            overscanCount={0}
            onScroll={(e: ListOnScrollProps) => handleWindowPdfScroll(e)}
            itemSize={(pageIndex) => getPageHeight(pageIndex, width)}
            onItemsRendered={(props: ListOnItemsRenderedProps) => {
              if (curPdfPage && curPdfPage > 0) {
                setAndDispatchPdfPage(curPdfPage, projId, "fullscreennav");
                let cp = curPdfPage;
                setTimeout(() => {
                  scrollToPage(cp, virtualListRef);
                }, 1000);

                curPdfPage = undefined;
              } else {
                setAndDispatchPdfPage(
                  props.overscanStopIndex,
                  projId,
                  "IntersectionObserver"
                );
              }
            }}
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
                  height={height}
                  style={style}
                  projId={projId}
                  viewPort={pageViewports[index]}
                  curPdfPosition={curPdfPosition}
                  viewModel={viewModel}
                />
              );
            }}
          </VariableSizeList>
        );
      }
    };

    const onResize = (size: Size) => { };

    // avoid the cached expired token
    if (
      pdfOptions &&
      pdfOptions.httpHeaders &&
      getAuthorization(pdfOptions.httpHeaders) !== "Bearer " + getAccessToken()
    ) {
      pdfOptions.httpHeaders = {
        Authorization: "Bearer " + getAccessToken(),
      };
    }

    return (
      <AutoSizer onResize={onResize}>
        {({ width, height }: { width: number; height: number }) => (
          <Document
            options={pdfOptions}
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
    let areAuthEqual = authTokenEquals(nextProps.pdfOptions);
    // if the final value is true, means did not need to rerender 
    return arePropsEqual && areAuthEqual;
  }
);

export default MemoizedPDFPreview;