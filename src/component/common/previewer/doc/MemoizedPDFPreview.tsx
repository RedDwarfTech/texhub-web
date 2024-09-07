import React, { useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import {
  DocumentCallback,
  Options,
  PageCallback,
} from "react-pdf/dist/cjs/shared/types";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { ProjInfo } from "@/model/proj/ProjInfo";
import Highlight from "../feat/highlight/Highlight";
import { PageViewport } from "pdfjs-dist";
import { readConfig } from "@/config/app/config-reader";
import { goPage } from "./PDFPreviewHandle";

interface PDFPreviewProps {
  curPdfUrl: string;
  projId: string;
  options: Options;
  viewModel: string;
  setPageNum: (page: number) => void;
  setCurPageNum: (page: number) => void;
}

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(
  ({
    curPdfUrl,
    projId,
    options,
    viewModel = "default",
    setPageNum,
    setCurPageNum,
  }) => {
    const [numPages, setNumPages] = useState<number>();
    let pdfScaleKey = "pdf:scale:" + projId;
    let cachedScale = Number(localStorage.getItem(pdfScaleKey));
    const [projAttribute, setProjAttribute] = useState<ProjAttribute>({
      pdfScale: cachedScale,
      legacyPdfScale: cachedScale
    });
    const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
    const [viewport, setViewport] = useState<PageViewport>();
    const { projAttr, pdfFocus, projInfo } = useSelector(
      (state: AppState) => state.proj
    );
    const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();
    const canvasArray = useRef<
      Array<React.MutableRefObject<HTMLCanvasElement | null>>
    >([]);
    let legacyRendered = new Map<string, boolean>();

    React.useEffect(() => {
      setCurProjInfo(projInfo);
    }, [projInfo]);

    React.useEffect(() => {
      if (projAttr.pdfScale === 1 && cachedScale) {
        return;
      }
      setProjAttribute(projAttr);
    }, [projAttr, cachedScale]);

    React.useEffect(() => {
      if (pdfFocus && pdfFocus.length > 0) {
        let pageNum = pdfFocus[0].page;
        setCurPdfPosition(pdfFocus);
        localStorage.setItem(
          readConfig("pdfCurPage") + curProjInfo?.main.project_id,
          pageNum.toString()
        );
        goPage(pageNum);
        setTimeout(() => {
          setCurPdfPosition([]);
        }, 5000);
      }
    }, [pdfFocus]);

    const updateRefArray = (
      index: number,
      element: HTMLCanvasElement | null
    ) => {
      if (element) {
        canvasArray.current[index] = { current: element };
      }
    };

    const handlePageChange = (page: any) => {};

    var pageObserve = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((item: IntersectionObserverEntry) => {
          if (item.intersectionRatio > 0) {
            let dataPage = item.target.getAttribute("data-page-number");
            // pass the current page to parent component
            setCurPageNum(Number(dataPage));
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

    const handlePageRenderSuccess = (
      page: PageCallback,
      curPage: number,
      legacyRenderedKey: string
    ) => {
      let elements = document.querySelectorAll(`.${styles.pdfPage}`);
      if (elements && elements.length > 0) {
        elements.forEach((box) => pageObserve.observe(box));
        restorePdfPosition();
      }
      let viewport: PageViewport = page.getViewport({ scale: cachedScale });
      setViewport(viewport);
      // remove legacy indicator
      legacyRendered.delete(legacyRenderedKey);
      // insert new indicator
      let newRenderedKey = curPage + "@" + projAttribute.pdfScale;
      legacyRendered.set(newRenderedKey, true);
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

    const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
      const { numPages } = pdf;
      setNumPages(numPages);
      setPageNum(numPages);
    };

    const getDynStyles = (viewModel: string) => {
      switch (viewModel) {
        case "default":
          return styles.previewBody;
        case "fullscreen":
          return styles.previewFsBody;
        default:
          return styles.previewBody;
      }
    };

    const renderPages = (totalPageNum: number | undefined) => {
      if (!totalPageNum || totalPageNum < 1) return;
      const tagList: JSX.Element[] = [];
      for (let curPageNo = 1; curPageNo <= totalPageNum; curPageNo++) {
        let legacyRenderedKey = curPageNo + "@" + projAttribute.legacyPdfScale;
        let legacyPage = legacyRendered.get(legacyRenderedKey);
        if (legacyPage && projAttribute.legacyPdfScale) {
          // if the new page did not rendered
          // show the legacy page
          // https://github.com/wojtekmaj/react-pdf/issues/875
          tagList.push(
            <Page
              key={legacyRenderedKey}
              className="prevPage"
              scale={projAttribute.legacyPdfScale}
              pageNumber={curPageNo}
            >
              {curPdfPosition && viewport ? (
                <Highlight
                  position={curPdfPosition}
                  pageNumber={curPageNo}
                  viewport={viewport}
                ></Highlight>
              ) : (
                <div></div>
              )}
            </Page>
          );
        } else {
          tagList.push(
            <Page
              key={curPageNo + "@" + projAttribute.pdfScale}
              className={styles.pdfPage}
              scale={projAttribute.pdfScale}
              onLoad={handlePageChange}
              canvasRef={(element) => updateRefArray(curPageNo, element)}
              onChange={handlePageChange}
              onRenderSuccess={(page: PageCallback) => {
                handlePageRenderSuccess(page, curPageNo, legacyRenderedKey);
              }}
              pageNumber={curPageNo}
            >
              {curPdfPosition && viewport ? (
                <Highlight
                  position={curPdfPosition}
                  pageNumber={curPageNo}
                  viewport={viewport}
                ></Highlight>
              ) : (
                <div></div>
              )}
            </Page>
          );
        }
      }
      return tagList;
    };

    const handlePdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const key = readConfig("pdfScrollKey") + projId;
      localStorage.setItem(key, scrollTop.toString());
    };

    /**
     * Open pdf's link in the browser new tab
     * https://github.com/diegomura/react-pdf/issues/645
     * @param e
     */
    const openPdfUrlLink = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if ((e.target as HTMLElement).tagName.toLowerCase() === "a") {
        window.open((e.target as HTMLAnchorElement).href);
      }
    };

    return (
      <div
        id="pdfContainer"
        className={getDynStyles(viewModel)}
        onClick={openPdfUrlLink}
        onScroll={(e) => handlePdfScroll(e)}
      >
        <Document
          options={options}
          file={curPdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {renderPages(numPages)}
        </Document>
      </div>
    );
  },
  (prevProps, nextProps) => {
    let arePropsEqual = prevProps.curPdfUrl === nextProps.curPdfUrl;
    return arePropsEqual;
  }
);

export default MemoizedPDFPreview;
