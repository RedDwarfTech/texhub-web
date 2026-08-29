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
  getCurPdfPage,
  getCurPdfScale,
  getCurPdfScrollOffset,
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
import {
  authTokenEquals,
  buildPdfHttpHeaders,
  getAuthorization,
} from "@/config/pdf/PdfJsConfig";
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
      // PDF 重载（编译后）时，在 List 卸载前捕获页内位置，待新 viewports 就绪后拉回。
      // 用页码 + 页内比例而不是像素 offset：编译后页面高度可能变化，像素会错位；
      // 若在 scrollHeight 未就绪时按 max 做 clamp，还会被压回第一页。
      type PdfScrollSnapshot = {
        offset: number;
        page: number;
        ratio: number;
      };
      const pendingReloadRestoreRef = useRef<PdfScrollSnapshot | null>(null);
      const liveScrollRef = useRef<PdfScrollSnapshot>({
        offset: 0,
        page: 0,
        ratio: 0,
      });
      const prevPdfUrlRef = useRef(curPdfUrl);
      const isReloadingPdfRef = useRef(false);
      const reloadGenRef = useRef(0);
      const restoredGenRef = useRef(0);
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

      const restoreScrollWithRetry = useCallback(
        (targetOffset: number, source: string) => {
          zoomScrollGuardRef.current = {
            target: targetOffset,
            until: Date.now() + 2500,
          };
          suppressRowsRenderedRef.current = true;

          let attempts = 0;
          const maxAttempts = 40;

          const finish = () => {
            isReloadingPdfRef.current = false;
            setTimeout(() => {
              suppressRowsRenderedRef.current = false;
            }, 300);
          };

          const tryRestore = () => {
            const el = virtualListRef.current?.element;
            if (!el) {
              if (++attempts < maxAttempts) {
                requestAnimationFrame(tryRestore);
              } else {
                finish();
              }
              return;
            }

            // 不要用当前 max scroll 去 clamp：List 刚挂载时 scrollHeight 往往
            // 仍约等于 clientHeight，clamp 会把目标偏移压成 0，看起来像回到第一页。
            el.scrollTop = targetOffset;
            markProgrammaticScroll();
            const settled = Math.abs(el.scrollTop - targetOffset) <= 1;

            if (!settled && ++attempts < maxAttempts) {
              requestAnimationFrame(tryRestore);
            } else {
              setCurPdfScrollOffset(el.scrollTop, projId, source);
              finish();
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
          isReloadingPdfRef.current = false;
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

      // PDF 重载入口捕获滚动位置：curPdfUrl 一变，react-pdf 的
      // resetDocument 会在 passive effect 里把 pdf 置 undefined，导致
      // children（List）卸载、滚动位置从 DOM 上丢失。因此在同一提交的
      // layout effect 阶段（此时旧 List 仍挂载）抢先捕获页码+页内比例，
      // 待新 viewports 就绪后拉回。
      React.useLayoutEffect(() => {
        const prevUrl = prevPdfUrlRef.current;
        prevPdfUrlRef.current = curPdfUrl;
        if (!prevUrl || prevUrl === curPdfUrl) {
          return;
        }

        const width = listWidthRef.current;
        const scrollEl = virtualListRef.current?.element;
        const live = liveScrollRef.current;
        let snapshot: PdfScrollSnapshot | null = null;

        if (scrollEl && pageViewports && width > 0) {
          const offset = scrollEl.scrollTop;
          let acc = 0;
          let captured = false;
          for (let i = 0; i < pageViewports.length; i++) {
            const pageViewport = pageViewports[i];
            const fitScale = width / pageViewport.width;
            const pageHeight = pageViewport.height * fitScale * committedScale + 10;
            if (offset < acc + pageHeight) {
              snapshot = {
                offset,
                page: i,
                ratio: pageHeight > 0 ? (offset - acc) / pageHeight : 0,
              };
              captured = true;
              break;
            }
            acc += pageHeight;
          }
          if (!captured && pageViewports.length > 0) {
            const last = pageViewports.length - 1;
            const pageViewport = pageViewports[last];
            const fitScale = width / pageViewport.width;
            const pageHeight = pageViewport.height * fitScale * committedScale + 10;
            snapshot = {
              offset,
              page: last,
              ratio: pageHeight > 0 ? Math.min((offset - acc + pageHeight) / pageHeight, 1) : 0,
            };
          }
        }

        if (
          (!snapshot || snapshot.offset <= 0) &&
          (live.offset > 0 || live.page > 0)
        ) {
          snapshot = { ...live };
        }

        if (!snapshot || (snapshot.offset <= 0 && snapshot.page <= 0)) {
          const savedPage = getCurPdfPage(projId);
          if (savedPage > 1) {
            snapshot = {
              offset: getCurPdfScrollOffset(projId),
              page: savedPage - 1,
              ratio: 0,
            };
          }
        }

        if (!snapshot) {
          return;
        }

        pendingReloadRestoreRef.current = snapshot;
        isReloadingPdfRef.current = true;
        suppressRowsRenderedRef.current = true;
        reloadGenRef.current += 1;
        // 立刻丢掉旧 viewports，避免新 pdf 对象到达时仍带着旧 viewports
        // 触发一次“假恢复”并把 pending 消费掉，随后 List 再以 scrollTop=0 重挂。
        setPageViewports(undefined);
        if (snapshot.offset > 0) {
          setCurPdfScrollOffset(snapshot.offset, projId, "reloadCapture");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps --
        // 只在 URL 变化时捕获当时的旧 viewports/滚动，不能把 pageViewports 放进 deps。
      }, [curPdfUrl, projId, virtualListRef]);

      React.useEffect(() => {
        // pdf 更换：预渲染缓存与可见范围全部失效。
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

        // 重载过程中 List 会先以 scrollTop=0 挂载，不能把这次 0 写进 live 快照，
        // 否则捕获的编译前位置会被覆盖。
        if (isReloadingPdfRef.current && scrollOffset < 10) {
          return;
        }

        const width = listWidthRef.current;
        const topPage = width > 0 ? findTopPageAt(scrollOffset, width) : null;
        if (topPage) {
          const pageHeight = getPageHeight(topPage.page, width);
          liveScrollRef.current = {
            offset: scrollOffset,
            page: topPage.page,
            ratio: pageHeight > 0 ? topPage.within / pageHeight : 0,
          };
        } else if (scrollOffset > 0) {
          liveScrollRef.current = {
            ...liveScrollRef.current,
            offset: scrollOffset,
          };
        }

        const docLoadTime = localStorage.getItem("docLoadTime");
        if (docLoadTime && isMoreThanFiveSeconds(docLoadTime)) {
          setCurPdfScrollOffset(scrollOffset, projId, "handleWindowPdfScroll");
          if (viewModel === "fullscreen") {
            setCurPdfScrollOffsetSession(scrollOffset, projId, viewModel);
          }
        }
      };

      // 新 PDF 的 viewports 就绪后再按页内比例恢复。
      // 用 reloadGen 保证一次编译只恢复一次，且不会在旧 viewports 上提前消费 pending。
      React.useEffect(() => {
        const pending = pendingReloadRestoreRef.current;
        if (
          !pending ||
          !pageViewports ||
          containerWidth <= 0 ||
          restoredGenRef.current === reloadGenRef.current
        ) {
          return;
        }

        restoredGenRef.current = reloadGenRef.current;
        pendingReloadRestoreRef.current = null;

        const maxPage = pageViewports.length - 1;
        if (maxPage < 0) {
          isReloadingPdfRef.current = false;
          suppressRowsRenderedRef.current = false;
          return;
        }

        const pageIndex = Math.min(Math.max(pending.page, 0), maxPage);
        let acc = 0;
        for (let i = 0; i < pageIndex; i++) {
          acc += getPageHeight(i, containerWidth);
        }
        const pageHeight = getPageHeight(pageIndex, containerWidth);
        const targetOffset =
          acc + Math.min(Math.max(pending.ratio, 0), 1) * Math.max(pageHeight - 1, 0);

        if (targetOffset < 1 && pageIndex <= 0) {
          isReloadingPdfRef.current = false;
          suppressRowsRenderedRef.current = false;
          return;
        }

        restoreScrollWithRetry(targetOffset, "reloadRestore");
        // eslint-disable-next-line react-hooks/exhaustive-deps --
        // getPageHeight 随 render 变化；以 pageViewports/containerWidth 作为就绪信号即可。
      }, [pageViewports, containerWidth, restoreScrollWithRetry]);

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
        restoreScrollWithRetry(targetOffset, "zoomRestore");
      }, [committedScale, containerWidth, resolveResizeScrollTop, restoreScrollWithRetry, virtualListRef]);

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
        pdfOptions.httpHeaders = buildPdfHttpHeaders();
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
