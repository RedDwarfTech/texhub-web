import React, { useState } from "react";
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const FullScreenIndependent: React.FC = () => {

  const [numPages, setNumPages] = useState<number>();
  const [containerWidth, setContainerWidth] = useState<number>();
  
  const params = new URLSearchParams(window.location.search);
  const projId = params.get("projId");
  const curPage = params.get("curPage");
  let pdfUrl = "/tex/file/pdf/partial?proj_id=" + projId;
  const maxWidth = 800;

  React.useEffect(() => {
    return () => {};
  }, []);

  if (!projId) {
    return <div>Loading...</div>;
  }

  const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
  wasmUrl: '/wasm/',
};

  return (
    <div>
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
