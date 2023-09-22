import React from 'react';
import { Document, Page } from 'react-pdf';
import styles from "./MemoizedPDFPreview.module.css";
import { Options } from 'react-pdf/dist/cjs/shared/types';

interface PDFPreviewProps {
    curPdfUrl: string;
    options: Options;
    onDocumentLoadSuccess: (pdf: any) => void;
    numPages: number;
    pdfScale: number;
}

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(({ curPdfUrl, options, onDocumentLoadSuccess, numPages, pdfScale }) => {

    const handlePageChange = (page: any) => {

    };

    const handlePageRenderSuccess = (page: any) => {
        const pageIndex = page._pageIndex + 1;
    };

    const renderPages = (totalPageNum: number | undefined) => {
        if (!totalPageNum || totalPageNum < 1) return;
        const tagList: JSX.Element[] = [];
        for (let i = 1; i <= totalPageNum; i++) {
            tagList.push(
                <Page key={i}
                    className={styles.pdfPage}
                    scale={pdfScale}
                    onLoad={handlePageChange}
                    onRenderSuccess={handlePageRenderSuccess}
                    pageNumber={i} >
                </Page>
            );
        }
        return tagList;
    }

    return (
        <div className={styles.previewBody}>
            <Document options={options} file={curPdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                {renderPages(numPages)}
            </Document>
        </div>
    );
}, (prevProps, nextProps) => {
    let shouldRerender = (prevProps.curPdfUrl === nextProps.curPdfUrl)
        && (prevProps.pdfScale === nextProps.pdfScale) && (prevProps.numPages === nextProps.numPages)
    return shouldRerender;
});

export default MemoizedPDFPreview;