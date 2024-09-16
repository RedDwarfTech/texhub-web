import React, { useRef, useState } from "react";
import { Page } from "react-pdf";
import styles from "./TeXPDFPage.module.css";
import { PageCallback } from "react-pdf/dist/cjs/shared/types";
import { readConfig } from "@/config/app/config-reader";
import { PageViewport } from "pdfjs-dist";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  projId: string;
  width: number;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({
  index,
  style,
  projId,
  width,
}) => {
  let pdfScaleKey = "pdf:scale:" + projId;
  let cachedScale = Number(localStorage.getItem(pdfScaleKey));
  const { projAttr } = useSelector((state: AppState) => state.proj);
  const canvasArray = useRef<
    Array<React.MutableRefObject<HTMLCanvasElement | null>>
  >([]);
  const [projAttribute, setProjAttribute] = useState<ProjAttribute>({
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

  const handlePageRenderSuccess = (page: PageCallback) => {
    setRenderedScale(projAttribute.pdfScale);
    setRenderedPageNumber(page.pageNumber);
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
      console.log("page" + pageNumber + " not rendered. using the legacy page");
      // debugger;
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
          key={pageNumber + "@" + projAttribute.legacyPdfScale}
          className="prevPage"
          scale={projAttribute.legacyPdfScale}
          pageNumber={pageNumber}
          // onLoad={handlePageChange}
          onChange={handlePageChange}
          //canvasRef={(element) => updateRefArray(index, element)}
          // onRenderSuccess={handlePageRenderSuccess}
          width={width}
        />
      );
    } else {
      console.log("page" + pageNumber + " has rendered");
      return null;
    }
  };

  const isLoading = renderedPageNumber !== index || renderedScale !== projAttribute.pdfScale;

  return (
    <div style={{
      ...style,
      paddingLeft: '60px',
      paddingRight: '60px',
      boxSizing: 'border-box',
      backgroundColor: 'lightgrey',
      transform: `scale(${projAttribute.pdfScale})`,
      }}>
      <Page
        key={index + "@" + projAttribute.pdfScale}
        className={styles.pdfPage}
        scale={projAttribute.pdfScale}
        onLoad={handlePageChange}
        canvasRef={(element) => updateRefArray(index, element)}
        onChange={handlePageChange}
        onRenderSuccess={handlePageRenderSuccess}
        pageNumber={index}
        width={width}
      ></Page> 
    </div>
  );
};

export default TeXPDFPage;
