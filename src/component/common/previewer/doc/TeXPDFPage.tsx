import React, { useRef, useState } from "react";
import { Page } from "react-pdf";
import styles from "./TeXPDFPage.module.css";
import { PageCallback } from "react-pdf/dist/cjs/shared/types";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import {
  getCurPdfScale,
  setCurPdfPage,
} from "@/service/project/preview/PreviewService";
import { PageViewport } from "pdfjs-dist";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import TeXPDFHighlight from "../feat/highlight/TeXPDFHighlight";
import { isMoreThanFiveSeconds } from "./PDFPreviewHandle";

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  projId: string;
  width: number;
  viewPort: PageViewport;
  curPdfPosition: PdfPosition[] | undefined;
  viewModel: string;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({
  index,
  style,
  projId,
  width,
  viewPort,
  curPdfPosition,
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
  const [renderedPageNumber, setRenderedPageNumber] = useState<number>(-1);
  const [renderedScale, setRenderedScale] = useState(1);

  React.useEffect(() => {
    if (projAttr.pdfScale === 1 && cachedScale) {
      return;
    }
    setProjAttribute(projAttr);
  }, [projAttr, cachedScale]);

  /**
   * the element and viewport intersection with 20% will trigger this action
   */
  var pageObserve = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((item: IntersectionObserverEntry) => {
        if (item.intersectionRatio > 0.2) {
          let docLoadTime = localStorage.getItem("docLoadTime");
          if (docLoadTime && isMoreThanFiveSeconds(docLoadTime)) {
            let dataPage = item.target.getAttribute("data-page-number");
            if (!dataPage) return;
            setCurPdfPage(Number(dataPage), projId, "IntersectionObserver");
          }
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  const handlePageRenderSuccess = (page: PageCallback) => {
    setRenderedScale(projAttribute.pdfScale);
    setRenderedPageNumber(page.pageNumber);
    let elements = document.querySelectorAll(`.${styles.pdfPage}`);
    if (elements && elements.length > 0) {
      elements.forEach((box) => pageObserve.observe(box));
    }
  };

  const handlePageChange = (page: any) => {};

  /**
   * to avoid the pdf page flashing & flicking when zoom the pdf
   * keep the legacy page before the new pdf page rendered success
   * https://github.com/wojtekmaj/react-pdf/issues/875
   * https://github.com/wojtekmaj/react-pdf/issues/418
   *
   * @param page
   */
  const renderLegacyPage = (pageNumber: number, width: number) => {
    if (isLoading) {
      return (
        <Page
          /**
           * IMPORTANT: Keys are necessary so that React will know which Page component
           * instances to use.
           * Without keys, on page number update, React would replace the page number
           * in 1st and 2nd page components. This may cause previously rendered page
           * to render again, thus causing a flash.
           * With keys, React, will add prevPage className to previously rendered page,
           * and mount new Page component instance for the new page.
           */
          key={pageNumber + "@legacy-" + projAttribute.legacyPdfScale}
          className="prevPage"
          scale={projAttribute.legacyPdfScale}
          pageNumber={pageNumber}
          onChange={handlePageChange}
          width={width}
        />
      );
    } else {
      console.log("page" + pageNumber + " has rendered");
      return null;
    }
  };

  const isLoading =
    renderedPageNumber !== index || renderedScale !== projAttribute.pdfScale;

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
      {isLoading && renderedPageNumber && renderedScale
        ? renderLegacyPage(index, width)
        : null}
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
      >
        {curPdfPosition && viewPort ? (
          <TeXPDFHighlight
            position={curPdfPosition}
            pageNumber={index}
            viewport={viewPort}
          ></TeXPDFHighlight>
        ) : (
          <div></div>
        )}
      </Page>
    </div>
  );
};

export default TeXPDFPage;
