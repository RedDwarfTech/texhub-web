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
  List,
  ListImperativeAPI,
  RowComponentProps,
} from "react-window";
import { asyncMap } from "@wojtekmaj/async-array-utils";
import { AutoSizer, Size } from "react-virtualized-auto-sizer";
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
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { CustomHighlightLayer, HighlightArea } from "../feat/highlight/CustomHighlightLayer";

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(
  ({
    curPdfUrl,
    projId,
    viewModel = "default",
    setPageNum,
    virtualListRef,
    pdfOptions,
    curPdfPage,
    onOutlineLoaded,
    onPdfLoaded,
  }) => {
    type PdfRowProps = {
      width: number;
      height: number;
      pageViewports: any;
      projId: string;
      curPdfPosition?: PdfPosition[];
      setAreas: (areas: HighlightArea[]) => void;
      viewModel: string;
    };

    let cachedScale = getCurPdfScale(projId, viewModel);
    const { pdfFocus, projAttr } = useSelector((state: AppState) => state.proj);
    const [pageLocalNum, setPageLocalNum] = useState<number>();
    const [highlightAreas, setHighlightAreas] = useState<HighlightArea[]>([]);
    const [pdf, setPdf] = useState<DocumentCallback>();
    const [pageViewports, setPageViewports] = useState<any>();
    const divRef = useRef<HTMLDivElement>(null);
    const [projAttribute, setProjAttribute] = useState<PreviewPdfAttribute>({
      pdfScale: cachedScale,
      legacyPdfScale: cachedScale,
    });
    const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();

    const setAreas = (areas: HighlightArea[]) => {
      setHighlightAreas(areas);
    }

    React.useEffect(() => {
      if (projAttr.pdfScale === 1 && cachedScale) {
        return;
      }
      setProjAttribute(projAttr);
      if (virtualListRef.current) {
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
      setPageLocalNum(numPages);
      setPdf(pdf);
      if (onPdfLoaded) {
        onPdfLoaded(pdf);
      }
      if (virtualListRef.current) {
        console.log("current list is not null");
      }
      setDocLoadTime();
      // Get outline
      pdf
        .getOutline()
        .then((outline) => {
          if (onOutlineLoaded) {
            onOutlineLoaded(outline || []);
          }
        })
        .catch((error) => {
          console.error("Failed to get outline:", error);
          if (onOutlineLoaded) {
            onOutlineLoaded([]);
          }
        });
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

    const handleWindowPdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollOffset = e.currentTarget.scrollTop;
      let docLoadTime = localStorage.getItem("docLoadTime");
      if (docLoadTime && isMoreThanFiveSeconds(docLoadTime)) {
        setCurPdfScrollOffset(scrollOffset, projId, "handleWindowPdfScroll");
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
        const PdfRow = ({
          index,
          style,
          width,
          height,
          pageViewports,
          projId,
          curPdfPosition,
          setAreas,
          viewModel,
        }: RowComponentProps<PdfRowProps>) => {
          return (
            <TeXPDFPage
              index={index + 1}
              width={width}
              height={height}
              style={style}
              projId={projId}
              viewPort={pageViewports[index]}
              curPdfPosition={curPdfPosition}
              setHighlightAreas={setAreas}
              viewModel={viewModel}
            />
          );
        };

        return (
          <List
            key={"pdfScrollList"}
            listRef={virtualListRef as React.RefObject<ListImperativeAPI>}
            rowCount={pdf.numPages}
            rowHeight={(pageIndex: number) => getPageHeight(pageIndex, width)}
            rowComponent={PdfRow}
            rowProps={{
              width,
              height,
              pageViewports,
              projId,
              curPdfPosition,
              setAreas,
              viewModel,
            }}
            overscanCount={0}
            onScroll={handleWindowPdfScroll}
            onRowsRendered={(visibleRows) => {
              if (curPdfPage && curPdfPage > 0) {
                setAndDispatchPdfPage(curPdfPage, projId, "fullscreennav");
                let cp = curPdfPage;
                setTimeout(() => {
                  scrollToPage(cp, virtualListRef);
                }, 1000);

                curPdfPage = undefined;
              } else {
                setAndDispatchPdfPage(
                  visibleRows.stopIndex,
                  projId,
                  "IntersectionObserver"
                );
              }
            }}
            style={{ width, height }}
          />
        );
      }
    };

    const onResize = (size: Size) => {};

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
      <AutoSizer
        onResize={onResize}
        style={{ width: "100%", height: "100%" }}
        renderProp={({ width, height }: { width: number | undefined; height: number | undefined }) => (
          <div id="autoSizerContainer" style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
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
                  height: viewModel === "fullscreen" ? "100%" : "100vh",
                  // do not setting the width to make it auto fit
                  width: viewModel === "fullscreen" ? "100%" : "100vw",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  flex: 1,
                  backgroundColor: "#ededed",
                }}
                onClick={openPdfUrlLink}
              >
                {renderPdfList(width || 0, height || 0)}
              </div>
            </Document>
            <CustomHighlightLayer
              highlightAreas={highlightAreas}
              totalPages={pageLocalNum || 0}
              scale={projAttribute.pdfScale}
            />
          </div>
        )}
      />
    );
  },
  (prevProps, nextProps) => {
    let arePropsEqual = prevProps.curPdfUrl === nextProps.curPdfUrl;
    let areAuthEqual = authTokenEquals(nextProps.pdfOptions);
    let binded = prevProps.virtualListRef.current !== null;
    // if the final value is true, means did not need to rerender
    return arePropsEqual && areAuthEqual && binded;
  }
);

export default MemoizedPDFPreview;
