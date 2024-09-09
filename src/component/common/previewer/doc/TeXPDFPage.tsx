import React from "react";
import { Page } from "react-pdf";
import styles from "./MemoizedPDFPreview.module.css";
import { PageCallback } from "react-pdf/dist/cjs/shared/types";

interface PDFPageProps {
    index: number;
    style: React.CSSProperties;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({ index, style }) => {
    debugger

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
              // canvasRef={(element) => updateRefArray(curPageNo, element)}
              onChange={handlePageChange}
              onRenderSuccess={(page: PageCallback) => {
                // handlePageRenderSuccess(page);
              }}
              pageNumber={curPageNo}
            >
            
            </Page>
          );
        }
        return tagList;
      };

    return (<div style={style}>Row {renderPages(index)}</div>);
}

export default TeXPDFPage;