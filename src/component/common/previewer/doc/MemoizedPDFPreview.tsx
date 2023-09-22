import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback, Options, PageCallback } from 'react-pdf/dist/cjs/shared/types';

interface PDFPreviewProps {
    curPdfUrl: string;
    options: Options;
    pdfScale: number;
}

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(({ curPdfUrl, options, pdfScale }) => {

    const [numPages, setNumPages] = useState<number>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    const handlePageChange = (page: any) => {

    };

    var io = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach((item: IntersectionObserverEntry) => {
            if (item.intersectionRatio > 0.5) {
                let dataPage = item.target.getAttribute('data-page-number');
                setCurrentPage(Number(dataPage));
            }
        })
    }, {
        root: null,
        threshold: 0.5,
    })

    const goPage = (i: number) => {
        let element = document.querySelectorAll(`.${styles.pdfPage}`);
        if (element && element.length > 0) {
            element[i]!.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const handlePageRenderSuccess = (page: PageCallback) => {
        //goPage(2);
        let elements = document.querySelectorAll(`.${styles.pdfPage}`);
        if (elements && elements.length > 0) {
            elements.forEach(box => io.observe(box));
        }
    };

    const onDocumentLoadSuccess1 = (pdf: DocumentCallback) => {
        const { numPages } = pdf;
        setNumPages(numPages);
        goPage(2);
    }

    const renderPages = (totalPageNum: number | undefined) => {
        if (!totalPageNum || totalPageNum < 1) return;
        const tagList: JSX.Element[] = [];
        for (let i = 1; i <= totalPageNum; i++) {
            tagList.push(
                <Page key={i}
                    className={styles.pdfPage}
                    scale={pdfScale}
                    onLoad={handlePageChange}
                    onChange={handlePageChange}
                    onRenderSuccess={handlePageRenderSuccess}
                    pageNumber={i} >
                </Page>
            );
        }
        return tagList;
    }


    return (
        <div className={styles.previewBody}>
            <Document options={options}
                file={curPdfUrl}
                onLoadSuccess={onDocumentLoadSuccess1}>
                {renderPages(numPages)}
            </Document>
        </div>
    );
}, (prevProps, nextProps) => {
    let shouldRerender = (prevProps.curPdfUrl === nextProps.curPdfUrl)
        && (prevProps.pdfScale === nextProps.pdfScale)
    return shouldRerender;
});

export default MemoizedPDFPreview;