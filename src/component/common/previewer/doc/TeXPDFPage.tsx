import React, { useRef, useState, useEffect } from "react";
import { Page } from "react-pdf";
import styles from "./TeXPDFPage.module.css";
import { PageCallback } from "react-pdf/dist/shared/types";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { getCurPdfScale } from "@/service/project/preview/PreviewService";
import { PageViewport } from "pdfjs-dist";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import TeXPDFHighlight from "../feat/highlight/TeXPDFHighlight";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
// Note: we intentionally do not extract highlights on page load to avoid
// repeated state updates that can cause re-render loops. Instead we attach
// mouse handlers to compute highlights on hover.

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  projId: string;
  width: number;
  height: number;
  viewPort: PageViewport;
  curPdfPosition: PdfPosition[] | undefined;
  setHighlightAreas: any
  viewModel: string;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({
  index,
  style,
  projId,
  width,
  height,
  viewPort,
  curPdfPosition,
  setHighlightAreas,
  viewModel,
}) => {
  let cachedScale = getCurPdfScale(projId, viewModel);
  const { projAttr } = useSelector((state: AppState) => state.proj);
  const canvasArray = useRef<
    Array<React.MutableRefObject<HTMLCanvasElement | null>>
  >([]);
  const [projAttribute, setProjAttribute] = useState<PreviewPdfAttribute>({
    pdfScale: cachedScale,
    legacyPdfScale: cachedScale,
  });
  const updateRefArray = (index: number, element: HTMLCanvasElement | null) => {
    if (element) {
      canvasArray.current[index] = { current: element };
    }
  };

  const pageRef = useRef<any | null>(null);
  const pageTextItemsRef = useRef<any[]>([]);
  const listenersAttachedRef = useRef(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const [pageViewport, setPageViewport] = useState<PageViewport | null>(null);

  // Effect to handle curPdfPosition changes and highlight rendering
  useEffect(() => {
    if (!pageViewport || !curPdfPosition || curPdfPosition.length === 0) {
      return;
    }
    
    // Filter positions for current page
    const currentPagePositions = curPdfPosition.filter(pos => pos.page === index);
    
    if (currentPagePositions.length > 0) {
      // Render highlights on canvas overlay
      renderHighlightsOnPage(currentPagePositions);
    }
  }, [curPdfPosition, index, pageViewport]);

  // Render highlights for PDF positions on the page
  const renderHighlightsOnPage = (positions: PdfPosition[]) => {
    if (!pageViewport) return;
    
    const container = document.getElementById("page-" + index);
    if (!container) return;
    
    // Remove existing highlight overlay if present
    let existingOverlay = container.querySelector('.pdf-highlight-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Create overlay canvas for highlights
    const overlay = document.createElement('div');
    overlay.className = 'pdf-highlight-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '10';
    
    // Render each highlight rectangle
    positions.forEach((pos) => {
      const highlightDiv = document.createElement('div');
      
      // Convert PDF coordinates to viewport coordinates
      const [x1, y1, x2, y2] = pageViewport.convertToViewportRectangle([
        pos.h,
        pos.v,
        pos.x,
        pos.y,
      ]);
      
      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y1 - y2);
      
      highlightDiv.style.position = 'absolute';
      highlightDiv.style.left = left + 'px';
      // Note: PDF coordinates are from bottom, viewport from top
      highlightDiv.style.top = (pageViewport.height - top - height) + 'px';
      highlightDiv.style.width = width + 'px';
      highlightDiv.style.height = height + 'px';
      highlightDiv.style.backgroundColor = 'rgba(255, 226, 143, 0.6)';
      highlightDiv.style.border = '1px solid rgba(255, 200, 0, 0.8)';
      highlightDiv.style.transition = 'background-color 0.3s ease';
      
      overlay.appendChild(highlightDiv);
    });
    
    container.appendChild(overlay);
  };

  // Find URL-like matches across an array of text items and map them to per-item ranges.
  const findUrlMatchesInItems = (items: any[]) => {
    if (!items || items.length === 0) return [];
    const parts = items.map((it) => it.str || "");
    const full = parts.join("");
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const matches: Array<any> = [];

    // Build index map of each item's start/end in the concatenated string
    const map: Array<{ start: number; end: number; len: number }> = [];
    let cursor = 0;
    for (let i = 0; i < parts.length; i++) {
      const len = parts[i].length;
      map.push({ start: cursor, end: cursor + len, len });
      cursor += len;
    }

    let m: RegExpExecArray | null;
    while ((m = urlRegex.exec(full)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      const group: any[] = [];
      // find overlapping items
      for (let i = 0; i < map.length; i++) {
        const entry = map[i];
        if (entry.end <= start) continue;
        if (entry.start >= end) break;
        const matchStartInItem = Math.max(0, start - entry.start);
        const matchEndInItem = Math.min(entry.len, end - entry.start);
        group.push({ itemIndex: i, item: items[i], matchStartInItem, matchEndInItem });
      }
      if (group.length > 0) matches.push({ text: m[0], start, end, parts: group });
    }
    return matches;
  };

  // Attach mouse handlers to the page's text layer. When hovering a span, compute the
  // URL match that includes that span and set highlight areas accordingly. Clear on mouseout.
  const attachTextLayerListeners = () => {
    if (listenersAttachedRef.current) return;
    const container = document.getElementById("page-" + index);
    if (!container) return;
    const textLayer = container.querySelector(".react-pdf__Page__textContent");
    if (!textLayer) return;

    const onMouseOver = (ev: Event) => {
      const e = ev as MouseEvent;
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName.toLowerCase() !== "span") return;
      // debounce rapid mouse moves
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = window.setTimeout(() => {
        const spans = Array.from(textLayer.querySelectorAll("span"));
        const idx = spans.indexOf(target);
        if (idx === -1) return;
        const items = pageTextItemsRef.current || [];
        const matches = findUrlMatchesInItems(items);
        // find a match that contains this item index
        const matched = matches.find((m) => m.parts.some((p: any) => p.itemIndex === idx));
        if (matched) {
          // build highlight area structure expected by CustomHighlightLayer
          const highlightArea = {
            pageIndex: (pageRef.current && pageRef.current.pageNumber)
              ? pageRef.current.pageNumber - 1
              : index,
            pageHeight: height,
            textItems: matched.parts,
          };
          setHighlightAreas([highlightArea]);
        } else {
          setHighlightAreas([]);
        }
      }, 120);
    };

    const onMouseOut = (_ev: Event) => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setHighlightAreas([]);
    };

    textLayer.addEventListener("mouseover", onMouseOver);
    textLayer.addEventListener("mousemove", onMouseOver);
    textLayer.addEventListener("mouseout", onMouseOut);
    listenersAttachedRef.current = true;

    // store listeners so we can remove them on cleanup
    (textLayer as any).__texhub_listeners = { onMouseOver, onMouseOut };
  };

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      const container = document.getElementById("page-" + index);
      if (!container) return;
      const textLayer = container.querySelector(".react-pdf__Page__textContent");
      if (!textLayer) return;
      const listeners = (textLayer as any).__texhub_listeners;
      if (listeners) {
        textLayer.removeEventListener("mouseover", listeners.onMouseOver);
        textLayer.removeEventListener("mousemove", listeners.onMouseOver);
        textLayer.removeEventListener("mouseout", listeners.onMouseOut);
      }
    };
  }, []);

  React.useEffect(() => {
    if (projAttr.pdfScale === 1 && cachedScale) {
      return;
    }
    setProjAttribute(projAttr);
    // Update viewport when scale changes
    if (pageRef.current && pageRef.current.getViewport) {
      const newViewport = pageRef.current.getViewport({ scale: projAttr.pdfScale || 1 });
      setPageViewport(newViewport);
    }
  }, [projAttr, cachedScale]);

  const handlePageRenderSuccess = (page: PageCallback) => {};

  const handlePageChange = (page: any) => {
    // Update viewport when page changes
    if (page && page.getViewport) {
      const viewport = page.getViewport({ scale: projAttribute.pdfScale || 1 });
      setPageViewport(viewport);
    }
  };

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
        width: `${projAttribute.pdfScale * width}`,
        left: `${
          ((width - projAttribute.pdfScale * width) * 100) / (2 * width)
        }%`,
      }}
    >
      <Page
        key={index + "@new-" + projAttribute.pdfScale}
        scale={projAttribute.pdfScale}
        className={styles.pdfPage}
        onLoad={handlePageChange}
        canvasRef={(element) => updateRefArray(index, element)}
        onChange={handlePageChange}
        onRenderSuccess={handlePageRenderSuccess}
        pageNumber={index}
        width={width}
        height={height}
        renderAnnotationLayer={true}
        renderTextLayer={true}
        onLoadSuccess={(page) => {
          // Cache page proxy and its text items; do NOT call extractTextItems here.
          pageRef.current = page
          // Get viewport for coordinate conversion
          const viewport = page.getViewport({ scale: projAttribute.pdfScale || 1 });
          setPageViewport(viewport);
          
          page.getTextContent().then((textContent: any) => {
            pageTextItemsRef.current = textContent.items || [];
            // Attach listeners to text layer so highlights are computed on hover only.
            // setTimeout(() => attachTextLayerListeners(), 50);
          })
        }}
      ></Page>
    </div>
  );
};

export default TeXPDFPage;
