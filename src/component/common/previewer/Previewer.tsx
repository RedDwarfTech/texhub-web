import React, { useRef, useState } from 'react';
import styles from './Previewer.module.css';
import { toast } from 'react-toastify';
import type { PDFDocumentProxy, PDFPageProxy, PageViewport, RenderTask } from 'pdfjs-dist';
import { PDFViewer } from "pdfjs-dist/web/pdf_viewer";
import { RenderParameters, TextContent } from 'pdfjs-dist/types/src/display/api';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export type ViewerProps = {
    pdfUrl: string | undefined;
};

/**
 * improve the pdf image quality: 
 * https://stackoverflow.com/questions/35400722/pdf-image-quality-is-bad-using-pdf-js
 * https://stackoverflow.com/questions/49426385/pdf-js-displays-pdf-documents-in-really-low-resolution-blurry-almost-is-this-h
 * https://stackoverflow.com/questions/21719393/how-to-improve-display-quality-in-pdf-js
 * 
 * the pdf scale issue: 
 */
const Previewer: React.FC<ViewerProps> = (props: ViewerProps) => {

    const canvasRef = useRef<any>(null);
    const [pageNum, setPageNum] = useState<number>(1);
    const [pdfScale, setPdfScale] = useState<number>(1);
    const [currentPdf, setCurrentPdf] = useState<PDFDocumentProxy>();
    const [pdfJs, setPdfJs] = useState<any>();
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    var PRINT_RESOLUTION = 600;
    var PRINT_UNITS = PRINT_RESOLUTION / 72;

    React.useEffect(() => {
        if (props.pdfUrl) {
            //initPdf(props.pdfUrl);
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
        if (docCavas) {
            docCavas.remove();
        }
        const el = window.document.createElement("canvas") as HTMLCanvasElement;
        el.id = "the-canvas" + pageNum;
        canvasRef.current.append(el);
        if (pageNum > pdf.numPages) {
            return;
        }
        const page: PDFPageProxy = await pdf.getPage(pageNum);
        const viewport: PageViewport = page.getViewport({
            scale: pdfScale,
            rotation: 0
        });

        let canvas = document.getElementById('the-canvas' + pageNum) as HTMLCanvasElement;
        canvas.height = Math.floor(viewport.height * PRINT_UNITS);
        canvas.width = Math.floor(viewport.width * PRINT_UNITS);
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) return;
        canvasContext.save();
        canvasContext.scale(pdfScale, pdfScale);
        canvasContext.fillStyle = 'rgb(255, 255, 255)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.restore();
        const cavasLayer = document.querySelector(`.${styles.cavasLayer}`) as HTMLDivElement;
        if (!cavasLayer) return;
        cavasLayer.style.width = Math.floor(viewport.width / pdfScale) + 'pt';
        cavasLayer.style.height = Math.floor(viewport.height / pdfScale) + 'pt';
        const renderContext: RenderParameters = {
            canvasContext: canvasContext,
            viewport: viewport,
            transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
        };
        const renderTask: RenderTask = page.render(renderContext);

        renderTextLayer(renderTask, pdfJS, page, viewport, canvas);
    }

    const renderTextLayer = (renderTask: RenderTask, pdfJS: any, page: PDFPageProxy, viewport: PageViewport, canvas: HTMLCanvasElement) => {
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
            setPdfScale(pdfScale - 0.1);
            //displayPage(currentPdf, pageNum);
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
            setPdfScale(pdfScale + 0.1);
            //displayPage(currentPdf, pageNum);
        }
    }

    const displayPage = (pdf: any, pageNum: number) => {
        pdf.getPage(pageNum).then(function getPage(page: number) { renderPdfPage(pdf, pdfJs, pageNum); });
    }
    const onDocumentLoadSuccess = () => {
        setNumPages(1);
    }

    return (
        <div id="preview" className={styles.preview}>
            <div className={styles.previewHader}>
                <button onClick={() => { handleDownloadPdf(props.pdfUrl) }}>下载PDF</button>
                <button id="zoominbutton" onClick={() => { handleZoomIn(props.pdfUrl) }}>放大</button>
                <button id="zoomoutbutton" onClick={() => { handleZoomOut(props.pdfUrl) }}>缩小</button>
            </div>
            <div className={styles.previewBody}>
                <Document file={props.pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page scale={pdfScale} pageNumber={pageNumber} />
                </Document>
                {/**<div className={styles.cavasLayer} ref={canvasRef}>
                <div className={styles.textLayer}></div>
                </div>**/}
                {/*https://stackoverflow.com/questions/33063213/pdf-js-with-text-selection*/}
            </div>
            <div className={styles.previewFooter}>
            </div>
        </div>
    );
}

export default Previewer;