import React, {
  useRef,
  useState,
  useImperativeHandle,
  useCallback,
} from "react";
import { Document } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";

import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import {
  isMoreThanFiveSeconds,
  openPdfUrlLink,
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
  setCurPdfScale,
  setCurPdfScrollOffset,
  setDocLoadTime,
} from "@/service/project/preview/PreviewService";
import { setProjAttr } from "@/service/project/ProjectService";
import TeXPDFPage from "./TeXPDFPage";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { getAccessToken } from "../../cache/Cache";
import { authTokenEquals, getAuthorization } from "@/config/pdf/PdfJsConfig";
import {
  captureScrollAnchor,
  restoreScrollFromAnchor,
  ScrollAnchor,
} from "../calc/ScrollUtil";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { CustomHighlightLayer, HighlightArea } from "../feat/highlight/CustomHighlightLayer";
import { DocumentCallback } from "react-pdf/dist/shared/types.js";
import { PDFPreviewZoomHandle } from "@/model/props/proj/pdf/PDFPreviewZoomHandle";

const ZOOM_DEBOUNCE_MS = 150;
const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

const MemoizedPDFPreview = React.memo(
  React.forwardRef<PDFPreviewZoomHandle, PDFPreviewProps>(
    (
      {
        curPdfUrl,
        projId,
        viewModel = "default",
        setPageNum,
        virtualListRef,
        pdfOptions,
        curPdfPage,
        onOutlineLoaded,
        onPdfLoaded,
      },
      ref
    ) => {
      type PdfRowProps = {
        width: number;
        height: number;
        pageViewports: any;
        curPdfPosition?: PdfPosition[];
        pdfScale: number;
        visualScale: number;
      };

      const initialScale = getCurPdfScale(projId, viewModel);
      const pdfFocus = useSelector((state: AppState) => state.proj.pdfFocus);
      const [pageLocalNum, setPageLocalNum] = useState<number>();
      const [highlightAreas, setHighlightAreas] = useState<HighlightArea[]>([]);
      const [pdf, setPdf] = useState<DocumentCallback>();
      const [pageViewports, setPageViewports] = useState<any>();
      const [committedScale, setCommittedScale] = useState(initialScale);
      const [visualScale, setVisualScale] = useState(initialScale);
      const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();

      const divRef = useRef<HTMLDivElement>(null);
      const suppressRowsRenderedRef = useRef(false);
      const initialPageNavRef = useRef(false);
      const zoomScrollGuardRef = useRef<{ target: number; until: number } | null>(
        null
      );
      const zoomDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const scrollAnchorRef = useRef<ScrollAnchor | null>(null);
      const pendingScrollRestoreRef = useRef(false);
      const committedScaleRef = useRef(initialScale);
      const visualScaleRef = useRef(initialScale);
      const listWidthRef = useRef(0);

      committedScaleRef.current = committedScale;
      visualScaleRef.current = visualScale;

      const restoreScrollAfterZoom = useCallback(
        (targetOffset: number) => {
          zoomScrollGuardRef.current = {
            target: targetOffset,
            until: Date.now() + 2000,
          };
          suppressRowsRenderedRef.current = true;

          let attempts = 0;
          const maxAttempts = 20;

          const tryRestore = () => {
            const el = virtualListRef.current?.element;
            if (!el) {
              if (++attempts < maxAttempts) {
                requestAnimationFrame(tryRestore);
              } else {
                suppressRowsRenderedRef.current = false;
              }
              return;
            }

            el.scrollTop = targetOffset;
            const settled = Math.abs(el.scrollTop - targetOffset) <= 1;

            if (!settled && ++attempts < maxAttempts) {
              requestAnimationFrame(tryRestore);
            } else {
              setCurPdfScrollOffset(el.scrollTop, projId, "zoomRestore");
              setTimeout(() => {
                suppressRowsRenderedRef.current = false;
              }, 300);
            }
          };

          requestAnimationFrame(tryRestore);
        },
        [projId, virtualListRef]
      );

      const commitScale = useCallback(
        (newScale: number) => {
          const oldScale = committedScaleRef.current;
          if (Math.abs(newScale - oldScale) < 0.001) {
            setVisualScale(newScale);
            return;
          }

          setCommittedScale(newScale);
          setVisualScale(newScale);
          committedScaleRef.current = newScale;
          visualScaleRef.current = newScale;

          setCurPdfScale(newScale, projId, viewModel);
          setProjAttr({
            pdfScale: newScale,
            legacyPdfScale: oldScale,
          });

          pendingScrollRestoreRef.current = true;
        },
        [projId, viewModel]
      );

      const applyVisualZoom = useCallback(
        (newScale: number) => {
          const scrollEl = virtualListRef.current?.element;
          if (scrollEl && !zoomDebounceRef.current) {
            scrollAnchorRef.current = captureScrollAnchor(
              scrollEl.scrollTop,
              scrollEl.clientHeight,
              committedScaleRef.current
            );
            setCurPdfScrollOffset(scrollEl.scrollTop, projId, "handleZoom");
          }

          visualScaleRef.current = newScale;
          setVisualScale(newScale);

          if (zoomDebounceRef.current) {
            clearTimeout(zoomDebounceRef.current);
          }
          zoomDebounceRef.current = setTimeout(() => {
            zoomDebounceRef.current = null;
            commitScale(newScale);
          }, ZOOM_DEBOUNCE_MS);
        },
        [commitScale, projId, virtualListRef]
      );

      useImperativeHandle(
        ref,
        () => ({
          zoomIn: () => {
            const current = visualScaleRef.current;
            const newScale =
              current >= MAX_SCALE ? MAX_SCALE : current + 0.1;
            if (Math.abs(newScale - current) < 0.001) {
              return;
            }
            applyVisualZoom(newScale);
          },
          zoomOut: () => {
            const current = visualScaleRef.current;
            const newScale =
              current <= MIN_SCALE ? MIN_SCALE : current - 0.1;
            if (Math.abs(newScale - current) < 0.001) {
              return;
            }
            applyVisualZoom(newScale);
          },
        }),
        [applyVisualZoom]
      );

      React.useEffect(() => {
        return () => {
          if (zoomDebounceRef.current) {
            clearTimeout(zoomDebounceRef.current);
          }
        };
      }, []);

      React.useLayoutEffect(() => {
        if (!pendingScrollRestoreRef.current || !scrollAnchorRef.current) {
          return;
        }
        pendingScrollRestoreRef.current = false;

        const el = virtualListRef.current?.element;
        if (!el) {
          return;
        }

        const targetOffset = restoreScrollFromAnchor(
          scrollAnchorRef.current,
          committedScale,
          el.clientHeight
        );
        scrollAnchorRef.current = null;
        restoreScrollAfterZoom(targetOffset);
      }, [committedScale, restoreScrollAfterZoom, virtualListRef]);

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
                .then((page: any) => page.getViewport({ scale: 1 }))
          );
          setPageViewports(nextPageViewports);
        })();
      }, [pdf]);

      React.useEffect(() => {
        if (pdfFocus && pdfFocus.length > 0) {
          const pageNum = pdfFocus[0].page;
          setAndDispatchPdfPage(pageNum, projId, "pdfFocus");
          setCurPdfPosition(pdfFocus);
          if (virtualListRef.current) {
            scrollToPage(pageNum, virtualListRef);
          }
        }
      }, [pdfFocus, projId, virtualListRef]);

      const onDocumentLoadSuccess = (loadedPdf: DocumentCallback) => {
        const { numPages } = loadedPdf;
        setPageNum(numPages);
        setPageLocalNum(numPages);
        setPdf(loadedPdf);
        if (onPdfLoaded) {
          onPdfLoaded(loadedPdf);
        }
        setDocLoadTime();
        loadedPdf
          .getOutline()
          .then((outline: any) => {
            if (onOutlineLoaded) {
              onOutlineLoaded(outline || []);
            }
          })
          .catch((error: any) => {
            console.error("Failed to get outline:", error);
            if (onOutlineLoaded) {
              onOutlineLoaded([]);
            }
          });
      };

      const getDynStyles = (vm: string) => {
        switch (vm) {
          case "default":
            return styles.previewBody;
          case "fullscreen":
            return styles.previewFsBody;
          default:
            return styles.previewBody;
        }
      };

      const handleWindowPdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollEl = e.currentTarget;
        let scrollOffset = scrollEl.scrollTop;

        const guard = zoomScrollGuardRef.current;
        if (
          guard &&
          Date.now() < guard.until &&
          scrollOffset < 10 &&
          guard.target > 50
        ) {
          scrollEl.scrollTop = guard.target;
          scrollOffset = guard.target;
        } else if (guard && Date.now() >= guard.until) {
          zoomScrollGuardRef.current = null;
        }

        const docLoadTime = localStorage.getItem("docLoadTime");
        if (docLoadTime && isMoreThanFiveSeconds(docLoadTime)) {
          setCurPdfScrollOffset(scrollOffset, projId, "handleWindowPdfScroll");
        }
      };

      const getPageHeight = (pageIndex: number, width: number) => {
        if (!pageViewports) {
          throw new Error("getPageHeight() called too early");
        }
        const pageViewport = pageViewports[pageIndex];
        const fitScale = width / pageViewport.width;
        const actualHeight = pageViewport.height * fitScale * committedScale;
        return actualHeight + 10;
      };

      const setAreas = (areas: HighlightArea[]) => {
        setHighlightAreas(areas);
      };

      const renderPdfList = (width: number, height: number) => {
        listWidthRef.current = width;
        if (pdf && pageViewports) {
          const PdfRow = ({
            index,
            style,
            width,
            height,
            pageViewports,
            curPdfPosition,
            pdfScale,
            visualScale,
          }: RowComponentProps<PdfRowProps>) => {
            return (
              <TeXPDFPage
                index={index + 1}
                width={width}
                height={height}
                style={style}
                viewPort={pageViewports[index]}
                curPdfPosition={curPdfPosition}
                pdfScale={pdfScale}
                visualScale={visualScale}
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
                curPdfPosition,
                pdfScale: committedScale,
                visualScale,
              }}
              overscanCount={2}
              onScroll={handleWindowPdfScroll}
              onRowsRendered={(visibleRows) => {
                if (suppressRowsRenderedRef.current) {
                  return;
                }

                if (
                  curPdfPage &&
                  curPdfPage > 0 &&
                  !initialPageNavRef.current
                ) {
                  initialPageNavRef.current = true;
                  setAndDispatchPdfPage(curPdfPage, projId, "fullscreennav");
                  requestAnimationFrame(() => {
                    scrollToPage(curPdfPage, virtualListRef);
                  });
                  return;
                }

                setAndDispatchPdfPage(
                  visibleRows.stopIndex,
                  projId,
                  "IntersectionObserver"
                );
              }}
              style={{ width, height }}
            />
          );
        }
      };

      const onResize = (_size: Size) => {};

      if (
        pdfOptions &&
        pdfOptions.httpHeaders &&
        getAuthorization(pdfOptions.httpHeaders) !==
          "Bearer " + getAccessToken()
      ) {
        pdfOptions.httpHeaders = {
          Authorization: "Bearer " + getAccessToken(),
        };
      }

      return (
        <AutoSizer
          onResize={onResize}
          style={{ width: "100%", height: "100%" }}
          renderProp={({
            width,
            height,
          }: {
            width: number | undefined;
            height: number | undefined;
          }) => (
            <div
              id="autoSizerContainer"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
              }}
            >
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
                scale={visualScale}
              />
            </div>
          )}
        />
      );
    }
  ),
  (prevProps, nextProps) => {
    const arePropsEqual = prevProps.curPdfUrl === nextProps.curPdfUrl;
    const areAuthEqual = authTokenEquals(nextProps.pdfOptions);
    const binded = prevProps.virtualListRef.current !== null;
    return arePropsEqual && areAuthEqual && binded;
  }
);

MemoizedPDFPreview.displayName = "MemoizedPDFPreview";

export default MemoizedPDFPreview;
