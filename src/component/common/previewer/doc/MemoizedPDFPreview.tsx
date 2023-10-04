import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback, Options, PageCallback } from 'react-pdf/dist/cjs/shared/types';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { ProjAttribute } from '@/model/prj/config/ProjAttribute';

interface PDFPreviewProps {
    curPdfUrl: string;
    options: Options;
}

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(({ curPdfUrl, options }) => {

    const [numPages, setNumPages] = useState<number>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [projAttribute, setProjAttribute] = useState<ProjAttribute>({ pdfScale: 1 });
    const { projAttr, pdfFocus } = useSelector((state: AppState) => state.proj);

    React.useEffect(() => {
        setProjAttribute(projAttr);
    }, [projAttr]);

    React.useEffect(() => {
        if (pdfFocus && pdfFocus.length > 0) {
            let pageNum = pdfFocus[0].page;
            goPage(pageNum);
        }
    }, [pdfFocus]);

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
        threshold: 0.5,
    })

    const goPage = (i: number) => {
        let element = document.querySelectorAll(`.${styles.pdfPage}`);
        if (element && element.length > 0) {
            element[i - 1]!.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const handlePageRenderSuccess = (page: PageCallback) => {
        let elements = document.querySelectorAll(`.${styles.pdfPage}`);
        if (elements && elements.length > 0) {
            elements.forEach(box => io.observe(box));
        }
    };

    const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
        const { numPages } = pdf;
        setNumPages(numPages);
        goPage(currentPage);
    }

    const renderPages = (totalPageNum: number | undefined) => {
        if (!totalPageNum || totalPageNum < 1) return;
        const tagList: JSX.Element[] = [];
        for (let i = 1; i <= totalPageNum; i++) {
            tagList.push(
                <Page key={i}
                    className={styles.pdfPage}
                    scale={projAttribute.pdfScale}
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
                onLoadSuccess={onDocumentLoadSuccess}>
                {renderPages(numPages)}
            </Document>
        </div>
    );
}, (prevProps, nextProps) => {
    let shouldRerender = (prevProps.curPdfUrl === nextProps.curPdfUrl)
    return shouldRerender;
});

export default MemoizedPDFPreview;