import React, { useRef, useState, useEffect } from "react";
import { Page } from "react-pdf";
import styles from "./TeXPDFPage.module.css";
import { PageViewport } from "pdfjs-dist";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import {
  getEffectivePageScale,
  pdfPositionToViewportRect,
} from "../feat/highlight/HighlightUtil";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { PageCallback } from "react-pdf/dist/shared/types.js";

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  width: number;
  height: number;
  renderWidth: number;
  viewPort: PageViewport;
  curPdfPosition: PdfPosition[] | undefined;
  pdfScale: number;
  visualScale: number;
  onPageClick?: (page: number, h: number, v: number) => void;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({
  index,
  style,
  width,
  height,
  renderWidth,
  curPdfPosition,
  pdfScale,
  visualScale,
  onPageClick,
}) => {
  const pageContentRef = useRef<HTMLDivElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
  const bufferReadyRef = useRef(false);
  const pageRef = useRef<any | null>(null);
  const [pageViewport, setPageViewport] = useState<PageViewport | null>(null);
  const [showBuffer, setShowBuffer] = useState(false);

  // 视觉变换 = 缩放比 × 宽度比。
  // 交互期（缩放/拖宽）只改 visualScale / width，不动 Page 的 scale/width，
  // 使 canvas 保持同一 key，避免 react-pdf 重挂载 canvas 导致闪烁。
  const widthRatio = renderWidth > 0 ? width / renderWidth : 1;
  const transformRatio = (visualScale / pdfScale) * widthRatio;
  const isVisualZoom = Math.abs(transformRatio - 1) > 0.001;

  // 提交 key（scale 或 renderWidth 变化）→ 显示旧画面快照，
  // 直到新 canvas 渲染完成，覆盖 react-pdf 重挂载+隐藏绘制导致的空白窗口。
  const renderKey = `${pdfScale}|${renderWidth}`;
  const prevRenderKeyRef = useRef(renderKey);

  useEffect(() => {
    if (prevRenderKeyRef.current !== renderKey) {
      prevRenderKeyRef.current = renderKey;
      if (bufferReadyRef.current) {
        setShowBuffer(true);
      }
    }
  }, [renderKey]);

  useEffect(() => {
    if (!pageViewport || !curPdfPosition || curPdfPosition.length === 0) {
      return;
    }
    const currentPagePositions = curPdfPosition.filter(
      (pos) => pos.page === index
    );
    if (currentPagePositions.length > 0) {
      renderHighlightsOnPage(currentPagePositions);
    }
  }, [curPdfPosition, index, pageViewport]);

  const updatePageViewport = (page: { getViewport: (params: { scale: number }) => PageViewport }) => {
    const effectiveScale = getEffectivePageScale(page, pdfScale || 1, width);
    setPageViewport(page.getViewport({ scale: effectiveScale }));
  };

  useEffect(() => {
    if (pageRef.current) {
      updatePageViewport(pageRef.current);
    }
  }, [pdfScale, width]);

  const renderHighlightsOnPage = (positions: PdfPosition[]) => {
    if (!pageViewport) return;

    const container = document.getElementById("page-" + index);
    if (!container) return;

    const pageElement = container.querySelector(
      ".react-pdf__Page"
    ) as HTMLElement | null;
    const overlayHost = pageElement ?? container;

    if (!overlayHost.style.position || overlayHost.style.position === "static") {
      overlayHost.style.position = "relative";
    }

    overlayHost.querySelector(".pdf-highlight-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "pdf-highlight-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "5";

    positions.forEach((pos) => {
      const { left, top, width, height } = pdfPositionToViewportRect(
        pos,
        pageViewport
      );
      const highlightDiv = document.createElement("div");
      highlightDiv.style.position = "absolute";
      highlightDiv.style.left = `${left}px`;
      highlightDiv.style.top = `${top}px`;
      highlightDiv.style.width = `${width}px`;
      highlightDiv.style.height = `${height}px`;
      highlightDiv.style.backgroundColor = "rgba(255, 226, 143, 0.6)";
      highlightDiv.style.border = "1px solid rgba(255, 200, 0, 0.8)";
      overlay.appendChild(highlightDiv);
    });

    overlayHost.appendChild(overlay);
  };

  const handlePageChange = (page: any) => {
    if (page?.getViewport) {
      pageRef.current = page;
      updatePageViewport(page);
    }
  };

  const handlePageRenderSuccess = (page: PageCallback) => {
    // 新 canvas 渲染完成：把刚画完的画面抓进常驻快照，
    // 供下一次提交（scale/renderWidth 变化）期间显示。
    const canvas = pageContentRef.current?.querySelector(
      ".react-pdf__Page canvas"
    ) as HTMLCanvasElement | null;
    const buffer = bufferCanvasRef.current;
    if (canvas && buffer && canvas.width > 0 && canvas.height > 0) {
      buffer.width = canvas.width;
      buffer.height = canvas.height;
      buffer.getContext("2d")?.drawImage(canvas, 0, 0);
      bufferReadyRef.current = true;
      setShowBuffer(false);
    }
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onPageClick || !pageViewport) {
      return;
    }
    const content = pageContentRef.current;
    if (!content) {
      return;
    }
    const rect = content.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const scaleX = pageViewport.width / rect.width;
    const scaleY = pageViewport.height / rect.height;
    const h = (e.clientX - rect.left) * scaleX;
    const v = (e.clientY - rect.top) * scaleY;
    onPageClick(index, h, v);
  };

  const layoutScale = pdfScale;

  return (
    <div
      id={"page-" + index}
      onClick={handlePageClick}
      style={{
        ...style,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: isVisualZoom ? "visible" : undefined,
        width: `${layoutScale * width}`,
        left: `${
          ((width - layoutScale * width) * 100) / (2 * width)
        }%`,
      }}
    >
      <div
        ref={pageContentRef}
        className={styles.pageContent}
        style={
          isVisualZoom
            ? {
                transform: `scale(${transformRatio})`,
                transformOrigin: "top center",
              }
            : undefined
        }
      >
        {/* 常驻缓冲 canvas：卸载会丢失已绘制的快照。``通过 visibility 控制显隐 */}
        <canvas
          ref={bufferCanvasRef}
          className={styles.bufferCanvas}
          style={{
            visibility: showBuffer ? "visible" : "hidden",
            transform: `scale(${transformRatio})`,
            transformOrigin: "top center",
          }}
        />
        <Page
          key={`page-${index}`}
          scale={pdfScale}
          className={styles.pdfPage}
          onLoad={handlePageChange}
          onChange={handlePageChange}
          onRenderSuccess={handlePageRenderSuccess}
          pageNumber={index}
          width={renderWidth}
          renderAnnotationLayer={true}
          renderTextLayer={true}
          onLoadSuccess={(page) => {
            pageRef.current = page;
            updatePageViewport(page);
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(TeXPDFPage, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.pdfScale === next.pdfScale &&
    prev.visualScale === next.visualScale &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.renderWidth === next.renderWidth &&
    prev.style.top === next.style.top &&
    prev.style.height === next.style.height &&
    prev.curPdfPosition === next.curPdfPosition
  );
});
