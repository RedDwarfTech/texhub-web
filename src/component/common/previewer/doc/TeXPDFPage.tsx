import React, { useRef, useState } from "react";
import { Page } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import { PageCallback } from "react-pdf/dist/cjs/shared/types";
import { readConfig } from "@/config/app/config-reader";
import { PageViewport } from "pdfjs-dist";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  projId: string;
  projAttribute: ProjAttribute;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({
  index,
  style,
  projId,
  projAttribute,
}) => {
  const [viewport, setViewport] = useState<PageViewport>();
  const canvasArray = useRef<
    Array<React.MutableRefObject<HTMLCanvasElement | null>>
  >([]);

  const updateRefArray = (index: number, element: HTMLCanvasElement | null) => {
    if (element) {
      canvasArray.current[index] = { current: element };
    }
  };

  var pageObserve = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((item: IntersectionObserverEntry) => {
        if (item.intersectionRatio > 0) {
          let dataPage = item.target.getAttribute("data-page-number");
          // pass the current page to parent component
          // setCurPageNum(Number(dataPage));
          if (!dataPage) return;
          localStorage.setItem(
            readConfig("pdfCurPage") + projId,
            dataPage.toString()
          );
        }
      });
    },
    {
      threshold: 0,
    }
  );

  const handlePageRenderSuccess = (page: PageCallback) => {
    let elements = document.querySelectorAll(`.${styles.pdfPage}`);
    if (elements && elements.length > 0) {
      elements.forEach((box) => pageObserve.observe(box));
      restorePdfPosition();
    }
    let viewport: PageViewport = page.getViewport({ scale: 1 });
    setViewport(viewport);
  };

  const restorePdfPosition = () => {
    const key = readConfig("pdfScrollKey") + projId;
    const scrollPosition = localStorage.getItem(key);
    if (scrollPosition) {
      setTimeout(() => {
        const pdfContainerDiv = document.getElementById("pdfContainer");
        if (pdfContainerDiv) {
          let scroll = parseInt(scrollPosition);
          pdfContainerDiv.scrollTop = scroll;
        }
      }, 0);
    }
  };
  const handlePageChange = (page: any) => {};

  return (
    <div style={style}>
      <Page
        key={index}
        //className={styles.pdfPage}
        scale={projAttribute.pdfScale}
        onLoad={handlePageChange}
        canvasRef={(element) => updateRefArray(index, element)}
        onChange={handlePageChange}
        onRenderSuccess={handlePageRenderSuccess}
        pageNumber={index}
      ></Page>
    </div>
  );
};

export default TeXPDFPage;
