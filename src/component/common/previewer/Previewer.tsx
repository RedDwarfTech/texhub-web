import React, { useRef, useState } from 'react';
import styles from './Previewer.module.css';
import { toast } from 'react-toastify';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { RenderParameters, TextContent } from 'pdfjs-dist/types/src/display/api';

export type ViewerProps = {
    pdfUrl: string | undefined;
};

const Previewer: React.FC<ViewerProps> = (props: ViewerProps) => {

    const canvasRef = useRef<any>(null);
    const [pageNum, setPageNum] = useState<number>(1);
    const [pdfScale, setPdfScale] = useState<number>(1);
    const [currentPdf, setCurrentPdf] = useState<PDFDocumentProxy>();
    const [pdfJs, setPdfJs] = useState<any>();

    React.useEffect(() => {
        if (props.pdfUrl) {
            initPdf(props.pdfUrl);
        }
    }, [props.pdfUrl]);

    if (!props.pdfUrl) {
        return (<div>Loading</div>);
    }

    const initPdf = async (pdfUrl: string) => {
        const pdfJS = await import('pdfjs-dist/build/pdf');
        pdfJS.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.js';
        setPdfJs(pdfJS);
        const pdf: PDFDocumentProxy = await pdfJS.getDocument({
            url: pdfUrl,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/cmaps/',
            cMapPacked: true,
        }).promise;
        setCurrentPdf(pdf);
        const totalPages = pdf.numPages;
        for (let currentPage = 0; currentPage < totalPages; currentPage++) {
            renderPdfPage(pdf, pdfJS, currentPage + 1);
        }
    }

    const renderPdfPage = async (pdf: PDFDocumentProxy, pdfJS: any, pageNum: number) => {
        if (!canvasRef || !canvasRef.current) return;
        const docCavas = document.getElementById("the-canvas" + pageNum);
        if (!docCavas) {
            const el = window.document.createElement("canvas") as HTMLCanvasElement;
            el.id = "the-canvas" + pageNum;
            canvasRef.current.append(el);
        }
        if (pageNum > pdf.numPages) {
            return;
        }
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({
            scale: pdfScale
        });
        let canvas = document.getElementById('the-canvas' + pageNum) as HTMLCanvasElement;
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext: RenderParameters = { canvasContext, viewport };
        const renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
            const textContent = page.getTextContent();
            return textContent;
        }).then(function (textContent: TextContent) {
            const textLayer = document.querySelector(`.${styles.textLayer}`) as HTMLDivElement;
            if (!textLayer) return;
            textLayer.style.left = canvas.offsetLeft + 'px';
            textLayer.style.top = canvas.offsetTop + 'px';
            textLayer.style.height = canvas.offsetHeight + 'px';
            textLayer.style.width = canvas.offsetWidth + 'px';
            textLayer.style.setProperty('--scale-factor', pdfScale.toString());
            pdfJS.renderTextLayer({
                textContentSource: textContent,
                container: textLayer,
                viewport: viewport,
                textDivs: []
            });
        });
    }

    const handleDownloadPdf = async (pdfUrl: any) => {
        if (!pdfUrl) {
            toast.error("PDF文件Url为空");
            return;
        }
        try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', 'main.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    }

    const handleZoomIn = async (pdfUrl: any) => {
        if (!pdfUrl) {
            toast.error("PDF文件Url为空");
            return;
        }
        var zoominbutton = document.getElementById("zoominbutton") as HTMLButtonElement;
        zoominbutton.onclick = function () {
            if (pdfScale <= 0.25) {
                return;
            }
            setPdfScale(pdfScale + 0.25);
            displayPage(currentPdf, pageNum);
        }
    }

    const handleZoomOut = async (pdfUrl: any) => {
        if (!pdfUrl) {
            toast.error("PDF文件Url为空");
            return;
        }
        var zoomoutbutton = document.getElementById("zoomoutbutton") as HTMLButtonElement;
        zoomoutbutton.onclick = function () {
            if (pdfScale <= 0.25) {
                return;
            }
            setPdfScale(pdfScale - 0.25);
            displayPage(currentPdf, pageNum);
        }
    }

    const displayPage = (pdf: any, pageNum: number) => {
        pdf.getPage(pageNum).then(function getPage(page: number) { renderPdfPage(pdf, pdfJs, page); });
    }

    return (
        <div id="preview" className={styles.preview}>
            <div className={styles.previewHader}>
                <button onClick={() => { handleDownloadPdf(props.pdfUrl) }}>下载PDF</button>
                <button id="zoominbutton" onClick={() => { handleZoomIn(props.pdfUrl) }}>放大</button>
                <button id="zoomoutbutton" onClick={() => { handleZoomOut(props.pdfUrl) }}>缩小</button>
            </div>
            <div className={styles.previewBody}>
                <div className={styles.cavasLayer} ref={canvasRef}>
                    {/**<div className={styles.textLayer}></div>**/}
                </div>
                {/*https://stackoverflow.com/questions/33063213/pdf-js-with-text-selection*/}
            </div>
            <div className={styles.previewFooter}>
            </div>
        </div>
    );
}

export default Previewer;