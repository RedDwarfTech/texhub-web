import React, { useRef, useState } from "react";
import { Document } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback, Options } from "react-pdf/dist/cjs/shared/types";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { ProjInfo } from "@/model/proj/ProjInfo";
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
    const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
    const { projAttr, pdfFocus, projInfo } = useSelector(
      (state: AppState) => state.proj
    );
    const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();
    const [pdf, setPdf] = useState<DocumentCallback>();
    const [pageViewports, setPageViewports] = useState<any>();
    const [width, setWidth] = useState(window.innerWidth);
    const divRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleResize = () => {
        if (divRef.current) {
          debugger;
          let divWidth = divRef.current.offsetWidth;
          debugger;
          console.warn("width:");
          console.warn("width:" + divWidth);
          setWidth(divWidth);
        } else {
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);

      if (divRef.current) {
        resizeObserver.observe(divRef.current);
      }

      // Cleanup observer on component unmount
      return () => {
        resizeObserver.disconnect();
      };
    }, []);

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

    /**
     * https://codesandbox.io/p/sandbox/react-pdf-react-window-forked-rcw56x?file=%2Fsrc%2FApp.js%3A81%2C35
     *
     * @returns
     */
    const renderPdfList = () => {
      if (pdf && pageViewports) {
        return (
          <AutoSizer onResize={onResize}>
            {({ width, height }: { width: number; height: number }) => (
              <VariableSizeList
                width={width}
                height={height}
                estimatedItemSize={50}
                itemCount={pdf.numPages}
                itemSize={getPageHeight}
              >
                {({ index, style }: { index: number; style: any }) => (
                  <TeXPDFPage
                    index={index}
                    width={width}
                    style={style}
                    projId={projId}
                  />
                )}
              </VariableSizeList>
            )}
          </AutoSizer>
        );
      } else {
        return <div>loading...</div>;
      }
    };
    const gridRef = React.createRef<HTMLButtonElement>();
    const onResize = (...args: any[]) => {
      if (gridRef.current != null) {
        //gridRef.current.resetAfterColumnIndex(0);
      }
    };

    return (
      <Document
        options={options}
        file={curPdfUrl}
        // className={styles.pdfDocument}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <div
          id="pdfContainer"
          ref={divRef}
          //className={getDynStyles(viewModel)}
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flex: 1,
          }}
          onClick={openPdfUrlLink}
          onScroll={(e) => handlePdfScroll(e)}
        >
          {renderPdfList()}
        </div>
      </Document>
    );
  },
  (prevProps, nextProps) => {
    let arePropsEqual = prevProps.curPdfUrl === nextProps.curPdfUrl;
    return arePropsEqual;
  }
);

export default MemoizedPDFPreview;
