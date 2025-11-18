import React, { useCallback, useState } from "react";
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useResizeObserver } from '@wojtekmaj/react-hooks';

const FullScreenIndependent: React.FC = () => {

  const [numPages, setNumPages] = useState<number>();
  const [containerWidth, setContainerWidth] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const params = new URLSearchParams(window.location.search);
  const projId = params.get("projId");
  const curPage = params.get("curPage");
  let pdfUrl = "/tex/file/pdf/partial?proj_id=" + projId;
  const maxWidth = 800;
  const resizeObserverOptions = {};



  React.useEffect(() => {
    return () => { };
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
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
    wasmUrl: '/wasm/',
  };

  return (
    <div ref={setContainerRef}>
      <Document file={pdfUrl} options={options}>
        {Array.from(new Array(numPages), (_el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
          />
        ))}
      </Document>
    </div>
  );
};

export default FullScreenIndependent;
