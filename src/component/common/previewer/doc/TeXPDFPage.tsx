import React, { useRef, useState } from "react";
import { Page } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import { PageCallback } from "react-pdf/dist/cjs/shared/types";
import { readConfig } from "@/config/app/config-reader";
import { PageViewport } from "pdfjs-dist";

interface PDFPageProps {
    index: number;
    style: React.CSSProperties;
    projId: string;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({ index, style, projId}) => {
    debugger
    const [viewport, setViewport] = useState<PageViewport>();
    const canvasArray = useRef<
      Array<React.MutableRefObject<HTMLCanvasElement | null>>
    >([]);

    const updateRefArray = (
        index: number,
        element: HTMLCanvasElement | null
      ) => {
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

    const renderPages = (totalPageNum: number | undefined) => {
        if (!totalPageNum || totalPageNum < 1) return;
        const tagList: JSX.Element[] = [];
        for (let curPageNo = 1; curPageNo <= totalPageNum; curPageNo++) {
          tagList.push(
            <Page
              key={curPageNo}
              className={styles.pdfPage}
              scale={1}
              onLoad={handlePageChange}
              canvasRef={(element) => updateRefArray(curPageNo, element)}
              onChange={handlePageChange}
              onRenderSuccess={(page: PageCallback) => {
                handlePageRenderSuccess(page);
              }}
              pageNumber={curPageNo}
            >
            
            </Page>
          );
        }
        return tagList;
      };

    return (<div style={style}>Row {index}</div>);
}

export default TeXPDFPage;