import React, { useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback, Options, PageCallback } from 'react-pdf/dist/cjs/shared/types';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { ProjAttribute } from '@/model/prj/config/ProjAttribute';
import { PdfPosition } from '@/model/prj/pdf/PdfPosition';
import { ProjInfo } from '@/model/prj/ProjInfo';
import Highlight from '../feat/highlight/Highlight';
import { PageViewport } from 'pdfjs-dist';

interface PDFPreviewProps {
    curPdfUrl: string;
    projId: string;
    options: Options;
}

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(({ curPdfUrl, projId, options }) => {

    const [numPages, setNumPages] = useState<number>();
    let cp = localStorage.getItem("pdf:" + projId);
    const [currentPage, setCurrentPage] = useState<number>(Number(cp));
    let pdfScaleKey = "pdf:scale:" + projId;
    let cachedScale = Number(localStorage.getItem(pdfScaleKey));
    const [projAttribute, setProjAttribute] = useState<ProjAttribute>({ pdfScale: cachedScale });
    const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
    const [viewport, setViewport] = useState<PageViewport>();
    const { projAttr, pdfFocus, projInfo } = useSelector((state: AppState) => state.proj);
    const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();
    const canvasArray = useRef<Array<React.MutableRefObject<HTMLCanvasElement | null>>>([]);

    React.useEffect(() => {
        setCurProjInfo(projInfo);
    }, [projInfo]);

    React.useEffect(() => {
        if (projAttr.pdfScale === 1 && cachedScale) {
            return;
        }
        setProjAttribute(projAttr);
    }, [projAttr]);

    React.useEffect(() => {
        if (pdfFocus && pdfFocus.length > 0) {
            let pageNum = pdfFocus[0].page;
            setCurPdfPosition(pdfFocus);
            localStorage.setItem("pdf:" + curProjInfo?.main.project_id, pageNum.toString());
            const pdfLocationKey = "pdf:location:" + projId;
            localStorage.removeItem(pdfLocationKey);
            goPage(pageNum);
        }
    }, [pdfFocus]);

    const updateRefArray = (index: number, element: HTMLCanvasElement | null) => {
        if (element) {
            canvasArray.current[index] = { current: element };
        }
    };

    const handlePageChange = (page: any) => {

    };

    var io = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach((item: IntersectionObserverEntry) => {
            if (item.intersectionRatio > 0.5) {
                let dataPage = item.target.getAttribute('data-page-number');
                setCurrentPage(Number(dataPage));
                if (!dataPage) return;
                localStorage.setItem("pdf:" + projId, dataPage.toString())
            }
        })
    }, {
        threshold: 0.5,
    });

    const goPage = (i: number) => {
        let element = document.querySelectorAll(`.${styles.pdfPage}`);
        if (element && element.length > 0 && i) {
            element[i - 1]!.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const handlePageRenderSuccess = (page: PageCallback) => {
        let elements = document.querySelectorAll(`.${styles.pdfPage}`);
        if (elements && elements.length > 0) {
            elements.forEach(box => io.observe(box));
            restorePdfPosition();
        }
        let viewport: PageViewport = page.getViewport({ scale: cachedScale });
        setViewport(viewport);
    };

    const restorePdfPosition = () => {
        const key = "pdf:location:" + projId;
        const scrollPosition = localStorage.getItem(key);
        if (scrollPosition) {
            setTimeout(() => {
                const pdfContainerDiv = document.getElementById('pdfContainer');
                if (pdfContainerDiv) {
                    let scroll = parseInt(scrollPosition);
                    pdfContainerDiv.scrollTop = scroll;
                }
            }, 0);
        }
    }

    const onDocumentLoadSuccess = (pdf: DocumentCallback) => {
        const { numPages } = pdf;
        setNumPages(numPages);
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
                    canvasRef={(element) => updateRefArray(i, element)}
                    onChange={handlePageChange}
                    onRenderSuccess={handlePageRenderSuccess}
                    pageNumber={i} >
                    {curPdfPosition && viewport ? <Highlight position={curPdfPosition}
                        pageNumber={i}
                        viewport={viewport}></Highlight> : <div></div>}
                </Page>
            );
        }
        return tagList;
    }

    const handlePdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const key = "pdf:location:" + projId;
        localStorage.setItem(key, scrollTop.toString());
    }

    return (
        <div id="pdfContainer" className={styles.previewBody} onScroll={(e) => handlePdfScroll(e)}>
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