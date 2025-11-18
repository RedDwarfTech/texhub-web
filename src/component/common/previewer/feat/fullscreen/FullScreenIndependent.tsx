import React, { useCallback, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { PDFDocumentProxy } from "pdfjs-dist";
import { DocumentCallback } from "react-pdf/dist/shared/types";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/${pdfjs.version}/pdf.worker.min.mjs`;
const FullScreenIndependent: React.FC = () => {
  const [numPages, setNumPages] = useState<number>();
  const [containerWidth, setContainerWidth] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const params = new URLSearchParams(window.location.search);
  const projId = params.get("projId");
  const curPage = params.get("curPage");
  const pdfUrl = params.get("pdfUrl");
  const maxWidth = 800;
  const resizeObserverOptions = {};

  React.useEffect(() => {
    return () => {};
  }, []);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  if (!projId) {
    return <div>Loading...</div>;
  }

  const options = {
    cMapUrl: "/cmaps/",
    standardFontDataUrl: "/standard_fonts/",
    wasmUrl: "/wasm/",
  };

  const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
    setNumPages(pdf.numPages);
  };

  return (
    <div ref={setContainerRef}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
      >
        {Array.from(new Array(numPages), (_el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
          />
        ))}
      </Document>
    </div>
  );
};

export default FullScreenIndependent;
