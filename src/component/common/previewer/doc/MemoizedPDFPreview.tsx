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
import { VariableSizeList } from "react-window";
import { asyncMap } from "@wojtekmaj/async-array-utils";
import TeXPDFPage from "./TeXPDFPage";
import AutoSizer from "react-virtualized-auto-sizer";

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
      legacyPdfScale: cachedScale,
    });
    const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();

    const { projAttr, pdfFocus, projInfo } = useSelector(
      (state: AppState) => state.proj
    );
    const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();

    const [pdf, setPdf] = useState<DocumentCallback>();
    const [pageViewports, setPageViewports] = useState<any>();
    const [width, setWidth] = useState(window.innerWidth);

    React.useEffect(() => {
      setPageViewports(undefined);

      if (!pdf) {
        return;
      }

      (async () => {
        const pageNumbers = Array.from(new Array(pdf.numPages)).map(
          (_, index) => index + 1
        );

        const nextPageViewports = await asyncMap(
          pageNumbers,
          (pageNumber: number) =>
            pdf
              .getPage(pageNumber)
              .then((page) => page.getViewport({ scale: 1 }))
        );
        setPageViewports(nextPageViewports);
      })();
    }, [pdf]);

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

    const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
      const { numPages } = pdf;
      setNumPages(numPages);
      setPageNum(numPages);
      setPdf(pdf);
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

    const handlePdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const key = readConfig("pdfScrollKey") + projId;
      localStorage.setItem(key, scrollTop.toString());
    };

    const getPageHeight = (pageIndex: number) => {
      if (!pageViewports) {
        throw new Error("getPageHeight() called too early");
      }

      const pageViewport = pageViewports[pageIndex];
      const scale = width / pageViewport.width;
      const actualHeight = pageViewport.height * scale;

      return actualHeight;
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

    const renderPdfList = () => {
      if (pdf && pageViewports) {
        return (
          
              <VariableSizeList
                width={900}
                height={1200}
                estimatedItemSize={50}
                itemCount={pdf.numPages}
                itemSize={getPageHeight}
              >
                {({ index, style }: { index: number; style: any }) => (
                  <TeXPDFPage
                    index={index}
                    style={style}
                    projId={projId}
                    projAttribute={projAttribute}
                  />
                )}
              </VariableSizeList>
          
        );
      } else {
        return <div>loading...</div>;
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
          {renderPdfList()}
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
