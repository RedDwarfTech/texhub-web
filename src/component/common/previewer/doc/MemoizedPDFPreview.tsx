import React, { useRef, useState } from 'react';
import { Document, Page, PageProps, pdfjs } from 'react-pdf';
import styles from "./MemoizedPDFPreview.module.css";
import { DocumentCallback, Options, PageCallback } from 'react-pdf/dist/cjs/shared/types';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import { ProjAttribute } from '@/model/prj/config/ProjAttribute';
import { PdfPosition } from '@/model/prj/pdf/PdfPosition';
import { ProjInfo } from '@/model/prj/ProjInfo';

interface PDFPreviewProps {
    curPdfUrl: string;
    projId: string;
    options: Options;
}

const MemoizedPDFPreview: React.FC<PDFPreviewProps> = React.memo(({ curPdfUrl, projId, options }) => {

    const [numPages, setNumPages] = useState<number>();
    let cp = localStorage.getItem("pdf:" + projId);
    const [currentPage, setCurrentPage] = useState<number>(Number(cp));
    const [projAttribute, setProjAttribute] = useState<ProjAttribute>({ pdfScale: 1 });
    const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
    const { projAttr, pdfFocus, projInfo } = useSelector((state: AppState) => state.proj);
    const [curPdfPosition, setCurPdfPosition] = useState<PdfPosition[]>();
    const canvasArray = useRef<Array<React.MutableRefObject<HTMLCanvasElement | null>>>([]);

    React.useEffect(() => {
        setCurProjInfo(projInfo);
    }, [projInfo]);

    React.useEffect(() => {
        setProjAttribute(projAttr);
    }, [projAttr]);

    React.useEffect(() => {
        if (pdfFocus && pdfFocus.length > 0) {
            let pageNum = pdfFocus[0].page;
            setCurPdfPosition(pdfFocus);
            localStorage.setItem("pdf:" + curProjInfo?.main.project_id, pageNum.toString());
            goPage(pageNum);
            renderHighlight(pdfFocus);
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
    })

    const renderHighlight = (ranges: PdfPosition[]) => {
        if (ranges && ranges.length > 0) {
            ranges.forEach((item: PdfPosition) => {
                renderSingleHighlight(item);
            });
        }
    }

    const renderSingleHighlight = (item: PdfPosition) => {
        let page = item.page;
        let canvas = canvasArray.current[page];
        if(!canvas || !canvas.current) return;
        var context = canvas.current.getContext('2d');
        if(!context) return;
        var { width, height } = canvas.current;
        context.save();
        context.translate(width / 2, height / 2);
        context.globalCompositeOperation = 'multiply';
        context.textAlign = 'center';
        context.font = '100px sans-serif';
        context.fillStyle = 'rgba(22, 123, 140, 125)';
        debugger
        context.fillRect(item.h,item.v, item.width, item.height);
        context.restore();
    }

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
                    canvasRef={(element) => updateRefArray(i, element)}
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