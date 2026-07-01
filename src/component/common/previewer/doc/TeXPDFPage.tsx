import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { Page } from "react-pdf";
import styles from "./TeXPDFPage.module.css";
import { PageViewport } from "pdfjs-dist";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { computeMedianLineStep, pdfPositionToViewportRect } from "../feat/highlight/HighlightUtil";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { PageCallback } from "react-pdf/dist/shared/types.js";

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  width: number;
  height: number;
  viewPort: PageViewport;
  curPdfPosition: PdfPosition[] | undefined;
  pdfScale: number;
  visualScale: number;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({
  index,
  style,
  width,
  height,
  curPdfPosition,
  pdfScale,
  visualScale,
}) => {
  const pageContentRef = useRef<HTMLDivElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<any | null>(null);
  const prevPdfScaleRef = useRef(pdfScale);
  const [pageViewport, setPageViewport] = useState<PageViewport | null>(null);
  const [showBuffer, setShowBuffer] = useState(false);

  const transformRatio =
    pdfScale > 0 ? visualScale / pdfScale : 1;
  const isVisualZoom = Math.abs(transformRatio - 1) > 0.001;

  useLayoutEffect(() => {
    if (pdfScale === prevPdfScaleRef.current) {
      return;
    }
    const canvas = pageContentRef.current?.querySelector(
      "canvas"
    ) as HTMLCanvasElement | null;
    const buffer = bufferCanvasRef.current;
    if (canvas && buffer && canvas.width > 0 && canvas.height > 0) {
      buffer.width = canvas.width;
      buffer.height = canvas.height;
      buffer.getContext("2d")?.drawImage(canvas, 0, 0);
      setShowBuffer(true);
    }
    prevPdfScaleRef.current = pdfScale;
  }, [pdfScale]);

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

    const lineStep = computeMedianLineStep(positions);

    positions.forEach((pos) => {
      const { left, top, width, height } = pdfPositionToViewportRect(
        pos,
        pageViewport,
        lineStep
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
    if (page && page.getViewport) {
      const viewport = page.getViewport({ scale: pdfScale || 1 });
      setPageViewport(viewport);
    }
  };

  const handlePageRenderSuccess = (_page: PageCallback) => {
    setShowBuffer(false);
  };

  const layoutScale = pdfScale;

  return (
    <div
      id={"page-" + index}
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
        {showBuffer && (
          <canvas ref={bufferCanvasRef} className={styles.bufferCanvas} />
        )}
        <Page
          key={`page-${index}`}
          scale={pdfScale}
          className={styles.pdfPage}
          onLoad={handlePageChange}
          onChange={handlePageChange}
          onRenderSuccess={handlePageRenderSuccess}
          pageNumber={index}
          width={width}
          height={height}
          renderAnnotationLayer={true}
          renderTextLayer={true}
          onLoadSuccess={(page) => {
            pageRef.current = page;
            const viewport = page.getViewport({ scale: pdfScale || 1 });
            setPageViewport(viewport);
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
    prev.style.top === next.style.top &&
    prev.style.height === next.style.height &&
    prev.curPdfPosition === next.curPdfPosition
  );
});
