import React, { useCallback, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { DocumentCallback } from "react-pdf/dist/shared/types.js";
import "./FullScreenIndependent.module.css";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    return <div>{t("tips_loading")}</div>;
  }

  const options = {
    cMapUrl: `/pdfjs-dist/${pdfjs.version}/cmaps/`,
    standardFontDataUrl: `/pdfjs-dist/${pdfjs.version}/standard_fonts/`,
    wasmUrl: `/pdfjs-dist/${pdfjs.version}/wasm/`,
  };

  const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
    setNumPages(pdf.numPages);
  };

  return (
    <div ref={setContainerRef} className="Example__container__document">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
        suspense={false}
      >
        {Array.from(new Array(numPages), (_el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            suspense={false}
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
