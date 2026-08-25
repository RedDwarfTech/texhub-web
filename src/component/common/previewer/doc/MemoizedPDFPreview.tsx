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
  isProgrammaticScroll,
  markProgrammaticScroll,
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
  getCurPdfScrollOffsetSession,
  setAndDispatchPdfPage,
  setCurPdfScale,
  setCurPdfScrollOffset,
  setCurPdfScrollOffsetSession,
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
        onPageClick,
      },
      ref
    ) => {
      type PdfRowProps = {
        width: number;
        height: number;
        renderWidth: number;
        pageViewports: any;
        curPdfPosition?: PdfPosition[];
        pdfScale: number;
        visualScale: number;
        onPageClick?: (page: number, h: number, v: number) => void;
        prerenderMap?: Map<number, HTMLCanvasElement>;
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
      const [containerWidth, setContainerWidth] = useState(0);
      // 渲染宽度：提交后传给 Page 的固定渲染尺寸。
      // 拖拽期间 containerWidth 实时变化用于滚动数学/CSS 拉伸，
      // renderWidth 防抖提交后才变化，避免每帧重栅格化 canvas。
      const [renderWidth, setRenderWidth] = useState(0);
      const renderWidthRef = useRef(0);
      const renderWidthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
      );

      const divRef = useRef<HTMLDivElement>(null);
      const suppressRowsRenderedRef = useRef(false);
      const initialPageNavRef = useRef(false);
      const zoomScrollGuardRef = useRef<{ target: number; until: number } | null>(
        null
      );
      const zoomDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
      const scrollAnchorRef = useRef<ScrollAnchor | null>(null);
      const pendingScrollRestoreRef = useRef(false);
      // 宽度拖拽期间复用的会话锚点：只在拖拽的开始捕获一次，
      // 拖拽过程中复用，避免把被浏览器 clamp 过的 scrollTop 吸收进数学。
      const resizeAnchorRef = useRef<{
        page: number;
        within: number;
        width: number;
      } | null>(null);
      const lastResizeTsRef = useRef(0);
      const resizeSessionTimerRef = useRef<
        ReturnType<typeof setTimeout> | null
      >(null);
      const committedScaleRef = useRef(initialScale);
      const visualScaleRef = useRef(initialScale);
      const listWidthRef = useRef(0);
      // PDF 重载（编译后）时，在 List 卸载前捕获滚动偏移，待新 viewports 就绪后拉回。
      const pendingReloadRestoreRef = useRef<number | null>(null);
      // 预渲染：防抖到期后先按"新宽度"离屏渲染可见页的正确布局位图，
      // 再提交 renderWidth。提交时 react-pdf 会重建 canvas + TextLayer + Annotation
      // （pageKey = pageIndex@scale 变化导致卸载重挂），窗口期页面内容
      // 不参与位图绘制；用预渲染位图作为 buffer 铺住，视觉无缝。
      const prerenderMapRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
      const prerenderGenRef = useRef(0);
      const prerenderWidthRef = useRef(0);
      const visibleRangeRef = useRef<{ startIndex: number; endIndex: number }>({
        startIndex: 0,
        endIndex: 0,
      });

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
            markProgrammaticScroll();
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

          // zoom 提交后 scale 已变，旧预渲染位图（按旧 scale 像素）作废，
          // 防止 renderKey(pdfScale 部分)变化时被错误复用。
          prerenderMapRef.current = new Map();

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
              listWidthRef.current * committedScaleRef.current
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
          pendingReloadRestoreRef.current = null;
          if (zoomDebounceRef.current) {
            clearTimeout(zoomDebounceRef.current);
          }
          if (resizeSessionTimerRef.current) {
            clearTimeout(resizeSessionTimerRef.current);
          }
          if (renderWidthTimerRef.current) {
            clearTimeout(renderWidthTimerRef.current);
          }
        };
      }, []);

      // PDF 重载恢复：viewports + containerWidth 都就绪后，拉回编译前的滚动位置。
      React.useEffect(() => {
        if (
          pendingReloadRestoreRef.current === null ||
          !pageViewports ||
          containerWidth <= 0
        ) {
          return;
        }
        const targetOffset = pendingReloadRestoreRef.current;
        pendingReloadRestoreRef.current = null;
        requestAnimationFrame(() => {
          const el = virtualListRef.current?.element;
          if (!el) {
            return;
          }
          const max = el.scrollHeight - el.clientHeight;
          const clamped = Math.min(targetOffset, Math.max(0, max));
          scrollToOffset(clamped, virtualListRef, projId);
        });
      }, [pageViewports, containerWidth, virtualListRef, projId]);

      React.useEffect(() => {
        // pdf 更换：在 List 卸载（pageViewports→undefined）前捕获滚动位置，
        // 待新 viewports 就绪后恢复到原处，避免编译重载后跳回第一页。
        const scrollEl = virtualListRef.current?.element;
        if (scrollEl && pdf) {
          pendingReloadRestoreRef.current = scrollEl.scrollTop;
        }

        // 预渲染缓存与可见范围全部失效。
        prerenderGenRef.current++;
        prerenderMapRef.current = new Map();
        prerenderWidthRef.current = 0;

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
          markProgrammaticScroll();
          scrollOffset = guard.target;
        } else if (guard && Date.now() >= guard.until) {
          zoomScrollGuardRef.current = null;
        }

        const docLoadTime = localStorage.getItem("docLoadTime");
        if (docLoadTime && isMoreThanFiveSeconds(docLoadTime)) {
          setCurPdfScrollOffset(scrollOffset, projId, "handleWindowPdfScroll");
          if (viewModel === "fullscreen") {
            setCurPdfScrollOffsetSession(scrollOffset, projId, viewModel);
          }
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

      const findTopPageAt = useCallback(
        (offset: number, width: number) => {
          if (!pageViewports) {
            return null;
          }
          let acc = 0;
          for (let i = 0; i < pageViewports.length; i++) {
            const h = getPageHeight(i, width);
            if (offset < acc + h) {
              return { page: i, within: offset - acc };
            }
            acc += h;
          }
          const last = pageViewports.length - 1;
          return {
            page: last,
            within: offset - (acc - getPageHeight(last, width)),
          };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pageViewports, committedScale]
      );

      const resolveResizeScrollTop = useCallback(
        (
          anchor: { page: number; within: number; width: number },
          newWidth: number
        ) => {
          if (!pageViewports) {
            return 0;
          }
          let acc = 0;
          for (let i = 0; i < anchor.page; i++) {
            acc += getPageHeight(i, newWidth);
          }
          const pageHeight = getPageHeight(anchor.page, newWidth);
          const ratio = newWidth / anchor.width;
          const scaledWithin = Math.max(0, anchor.within * ratio);
          return acc + Math.min(scaledWithin, pageHeight - 1);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pageViewports, committedScale]
      );

      React.useLayoutEffect(() => {
        const widthAnchor = resizeAnchorRef.current;
        if (widthAnchor && !scrollAnchorRef.current) {
          pendingScrollRestoreRef.current = false;
          const el = virtualListRef.current?.element;
          if (!el) {
            return;
          }
          const scrollTopBefore = el.scrollTop;
          const targetOffset = resolveResizeScrollTop(
            widthAnchor,
            containerWidth
          );
          // 宽度变化时尽量在布局阶段同步写入 scrollTop，
          // 避免每个拖拽帧先画出“未校正”的画面再被 rAF 拉回。
          zoomScrollGuardRef.current = {
            target: targetOffset,
            until: Date.now() + 1000,
          };
          suppressRowsRenderedRef.current = true;
          el.scrollTop = targetOffset;
          markProgrammaticScroll();
          setCurPdfScrollOffset(el.scrollTop, projId, "resizeRestore");
          console.debug(
            "[pdf-resize] restore(width) sync " +
              JSON.stringify({
                anchor: widthAnchor,
                containerWidth,
                scrollTopBefore,
                targetOffset,
                scrollTopAfter: el.scrollTop,
                scrollHeightAfter: el.scrollHeight,
                clientHeight: el.clientHeight,
              })
          );

          let attempts = 0;
          const maxAttempts = 20;
          const tryConfirm = () => {
            const elCur = virtualListRef.current?.element;
            if (!elCur) {
              if (++attempts < maxAttempts) {
                requestAnimationFrame(tryConfirm);
              } else {
                suppressRowsRenderedRef.current = false;
              }
              return;
            }
            const settled = Math.abs(elCur.scrollTop - targetOffset) <= 1;
            console.debug(
              "[pdf-resize] restoreSettled(width) " +
                JSON.stringify({
                  targetOffset,
                  scrollTop: elCur.scrollTop,
                  settled,
                  attempts,
                })
            );
            if (!settled && ++attempts < maxAttempts) {
              elCur.scrollTop = targetOffset;
              markProgrammaticScroll();
              requestAnimationFrame(tryConfirm);
            } else {
              setTimeout(() => {
                suppressRowsRenderedRef.current = false;
              }, 300);
            }
          };
          requestAnimationFrame(tryConfirm);
          return;
        }
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
          containerWidth * committedScale,
          el.clientHeight
        );
        scrollAnchorRef.current = null;
        restoreScrollAfterZoom(targetOffset);
      }, [committedScale, containerWidth, resolveResizeScrollTop, restoreScrollAfterZoom, virtualListRef]);

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
            renderWidth,
            pageViewports,
            curPdfPosition,
            pdfScale,
            visualScale,
            prerenderMap,
          }: RowComponentProps<PdfRowProps>) => {
            return (
              <TeXPDFPage
                index={index + 1}
                width={width}
                height={height}
                renderWidth={renderWidth}
                style={style}
                viewPort={pageViewports[index]}
                curPdfPosition={curPdfPosition}
                pdfScale={pdfScale}
                visualScale={visualScale}
                onPageClick={onPageClick}
                prerenderCanvas={prerenderMap?.get(index + 1)}
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
                // 首次 onResize 前 renderWidth 尚未提交，回退到实时宽度。
                renderWidth: renderWidth || width,
                pageViewports,
                curPdfPosition,
                pdfScale: committedScale,
                visualScale,
                prerenderMap: prerenderMapRef.current,
              }}
              overscanCount={2}
              onScroll={handleWindowPdfScroll}
              onRowsRendered={(visibleRows) => {
                visibleRangeRef.current = {
                  startIndex: visibleRows.startIndex,
                  endIndex: visibleRows.stopIndex,
                };
                if (suppressRowsRenderedRef.current) {
                  return;
                }

                if (
                  curPdfPage &&
                  curPdfPage > 0 &&
                  !initialPageNavRef.current
                ) {
                  initialPageNavRef.current = true;
                  const restoredOffset =
                    viewModel === "fullscreen"
                      ? getCurPdfScrollOffsetSession(projId, viewModel)
                      : 0;
                  if (restoredOffset > 0) {
                    // 刷新全屏：还原标签页内实际的滚动位置，
                    // 而不是跳回 URL 中固定的 curPage。
                    requestAnimationFrame(() => {
                      scrollToOffset(restoredOffset, virtualListRef, projId);
                    });
                    return;
                  }
                  setAndDispatchPdfPage(curPdfPage, projId, "fullscreennav");
                  requestAnimationFrame(() => {
                    scrollToPage(curPdfPage, virtualListRef);
                  });
                  return;
                }

                const visiblePage = visibleRows.startIndex + 1;
                setAndDispatchPdfPage(
                  visiblePage,
                  projId,
                  isProgrammaticScroll()
                    ? "outlineProgrammatic"
                    : "userScroll"
                );
              }}
              style={{ width, height }}
            />
          );
        }
      };

      // 预渲染可见页到"新宽度"的离屏位图（正确布局），
      // 供 renderWidth 提交后的重建窗口作为 buffer 显示。
      const prerenderVisiblePages = (
        targetWidth: number,
        onReady: (map: Map<number, HTMLCanvasElement>) => void
      ) => {
        if (!pdf || !pageViewports) {
          onReady(new Map());
          return;
        }
        const gen = ++prerenderGenRef.current;
        const { startIndex, endIndex } = visibleRangeRef.current;
        const dpr = window.devicePixelRatio || 1;
        const tasks: Promise<void>[] = [];
        const map = new Map<number, HTMLCanvasElement>();

        // 与 react-pdf 协同安全：预渲染与现有 canvas 并行渲染同一页
        // 可能冲突（pdf.js 同一 page 只允许一个 render task），
        // 因此先渲染空白页面？不需要，直接逐页 await 串行。
        const renderOne = async (index: number) => {
          if (!pdf) {
            return;
          }
          const page = await pdf.getPage(index + 1);
          const baseViewport = page.getViewport({ scale: 1 });
          const fitScale = targetWidth / baseViewport.width;
          const effectiveScale =
            (committedScaleRef.current > 0 ? committedScaleRef.current : 1) *
            fitScale;
          const renderViewport = page.getViewport({
            scale: effectiveScale * dpr,
          });
          const canvas = document.createElement("canvas");
          canvas.width = renderViewport.width;
          canvas.height = renderViewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return;
          }
          try {
            await page.render({
              canvasContext: ctx,
              viewport: renderViewport,
            } as any).promise;
          } catch (e) {
            // 渲染被中断（如 pdf 已更换），丢弃该页。
            return;
          }
          if (gen !== prerenderGenRef.current) {
            return;
          }
          map.set(index + 1, canvas);
        };

        // 预渲染窗口：可见页 + overscan(2)。
        const start = Math.max(0, startIndex - 2);
        const end = Math.min(pageViewports.length - 1, endIndex + 2);
        for (let i = start; i <= end; i++) {
          tasks.push(renderOne(i));
        }
        Promise.all(tasks).then(() => {
          if (gen !== prerenderGenRef.current) {
            onReady(new Map());
            return;
          }
          onReady(map);
        });
      };

      const onResize = (size: Size) => {
        const nextWidth = size.width ?? 0;
        const prevWidth = listWidthRef.current;
        const now = Date.now();
        const isNewSession =
          !resizeAnchorRef.current || now - lastResizeTsRef.current > 300;
        if (
          isNewSession &&
          prevWidth > 0 &&
          nextWidth > 0 &&
          Math.abs(nextWidth - prevWidth) > 1
        ) {
          const scrollEl = virtualListRef.current?.element;
          if (scrollEl) {
            const capturedScrollTop = scrollEl.scrollTop;
            const topPage = findTopPageAt(capturedScrollTop, prevWidth);
            console.debug(
              "[pdf-resize] onResize " +
                JSON.stringify({
                  prevWidth,
                  nextWidth,
                  capturedScrollTop,
                  topPage,
                  clientHeight: scrollEl.clientHeight,
                  scrollHeight: scrollEl.scrollHeight,
                  // DOM 容器实际宽度：用于核对 listWidthRef(prevWidth) 是否与
                  // 真实已渲染布局一致（判断捕获时机是否已落后于渲染）。
                  elOffsetWidth: scrollEl.offsetWidth,
                })
            );
            if (topPage) {
              resizeAnchorRef.current = {
                page: topPage.page,
                within: topPage.within,
                width: prevWidth,
              };
              pendingScrollRestoreRef.current = true;
            }
          }
        }
        lastResizeTsRef.current = now;
        if (resizeSessionTimerRef.current) {
          clearTimeout(resizeSessionTimerRef.current);
        }
        resizeSessionTimerRef.current = setTimeout(() => {
          // 拖拽结束后清空会话锚点，供下一次拖拽重新捕获。
          resizeAnchorRef.current = null;
          resizeSessionTimerRef.current = null;
        }, 300);
        setContainerWidth(nextWidth);

        // 渲染宽度防抖提交：拖拽期间保持 canvas 不动（CSS 拉伸跟随），
        // 松手后先预渲染"新宽度"正确布局位图，再提交，
        // react-pdf 重建窗口由预渲染位图铺住，视觉无缝。
        if (renderWidthRef.current === 0) {
          // 首次加载：同步初始化渲染宽度，避免 Page width=0 空白。
          renderWidthRef.current = nextWidth;
          setRenderWidth(nextWidth);
          return;
        }
        renderWidthRef.current = nextWidth;
        if (renderWidthTimerRef.current) {
          clearTimeout(renderWidthTimerRef.current);
        }
        renderWidthTimerRef.current = setTimeout(() => {
          renderWidthTimerRef.current = null;
          prerenderWidthRef.current = nextWidth;
          prerenderVisiblePages(nextWidth, (map) => {
            if (prerenderWidthRef.current !== nextWidth) {
              return;
            }
            prerenderMapRef.current = map;
            setRenderWidth(nextWidth);
          });
        }, 150);
      };

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
                    height: "100%",
                    width: "100%",
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
