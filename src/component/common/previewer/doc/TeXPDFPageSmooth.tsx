import React, { useState } from "react";
import { Page } from "react-pdf";
import {
  DocumentCallback,
  PageCallback,
} from "react-pdf/dist/cjs/shared/types";
import { Document } from "react-pdf";
// import "./styles.css";

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  projId: string;
  width: number;
}

const TeXPDFPageSmooth: React.FC<PDFPageProps> = ({
  index,
  style,
  projId,
  width,
}) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [renderedPageNumber, setRenderedPageNumber] = useState(1);
  const [renderedScale, setRenderedScale] = useState(1);

  const onDocumentLoadSuccess = (page: DocumentCallback) => {
    setNumPages(page.numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  function nextPage() {
    changePage(1);
  }

  const changeScale = (offset: number) => {
    setScale((prevScale) => prevScale + offset);
  };

  function decreaseScale() {
    changeScale(-0.1);
  }

  function increaseScale() {
    changeScale(0.1);
  }

  const isLoading =
    renderedPageNumber !== pageNumber || renderedScale !== scale;

  return (
    <div className="App">
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          Previous
        </button>{" "}
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
        <p>Scale {scale}</p>
        <button type="button" disabled={scale <= 0.5} onClick={decreaseScale}>
          -
        </button>{" "}
        0.5{" "}
        <input
          type="range"
          min="0.5"
          max="2"
          value={scale}
          onChange={(event) => setScale(Number(event.target.value))}
          step="0.1"
        />{" "}
        2{" "}
        <button type="button" disabled={scale >= 2} onClick={increaseScale}>
          +
        </button>
      </div>
      <Document file="sample.pdf" onLoadSuccess={onDocumentLoadSuccess}>
        {isLoading && renderedPageNumber && renderedScale ? (
          <Page
            key={renderedPageNumber + "@" + renderedScale}
            className="prevPage"
            pageNumber={renderedPageNumber}
            scale={renderedScale}
            width={400}
          />
        ) : null}
        <Page
          key={pageNumber + "@" + scale}
          pageNumber={pageNumber}
          onRenderSuccess={() => {
            setRenderedPageNumber(pageNumber);
            setRenderedScale(scale);
          }}
          scale={scale}
          width={400}
        />
      </Document>
    </div>
  );
};

export default TeXPDFPageSmooth;
