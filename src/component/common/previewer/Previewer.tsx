import React, { useRef } from 'react';
import styles from './Previewer.module.css';

export type ViewerProps = {
    pdfUrl: string | undefined;
};

const Previewer: React.FC<ViewerProps> = (props: ViewerProps) => {

    const canvasRef = useRef<any>(null);

    React.useEffect(() => {
        if (props.pdfUrl) {
            initPdf(props.pdfUrl);
        }
    }, [props.pdfUrl]);

    if(!props.pdfUrl){
        return (<div>Loading</div>);
    }

    const initPdf = async (pdfUrl: string) => {
        const pdfJS = await import('pdfjs-dist/build/pdf');
        pdfJS.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.js';
        const pdf = await pdfJS.getDocument({
            url: pdfUrl,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/cmaps/',
            cMapPacked: true,
        }).promise;
        const totalPages = pdf.numPages;
        for (let currentPage = 0; currentPage < totalPages; currentPage++) {
            renderPdfPage(pdf, pdfJS, currentPage + 1);
        }
    }

    const renderPdfPage = async (pdf: any, pdfJS: any, pageNum: number) => {
        if(!canvasRef || !canvasRef.current) return;
        const docCavas = document.getElementById("the-canvas" + pageNum);
        if(!docCavas) {
            const el = window.document.createElement("canvas") as HTMLCanvasElement;
            el.id ="the-canvas" + pageNum;
            canvasRef.current.append(el);
        }
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({
            scale: 1.0
        });
        let canvas = document.getElementById('the-canvas'+pageNum) as HTMLCanvasElement;
        const canvasContext = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = { canvasContext, viewport };
        const renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
            const textContent = page.getTextContent();
            return textContent;
        }).then(function (textContent: string) {
            const textLayer = document.querySelector(`.${styles.textLayer}`) as HTMLDivElement;
            if (!textLayer) return;
            textLayer.style.left = canvas.offsetLeft + 'px';
            textLayer.style.top = canvas.offsetTop + 'px';
            textLayer.style.height = canvas.offsetHeight + 'px';
            textLayer.style.width = canvas.offsetWidth + 'px';
            textLayer.style.setProperty('--scale-factor', '1.0');
            pdfJS.renderTextLayer({
                textContentSource: textContent,
                container: textLayer,
                viewport: viewport,
                textDivs: []
            });
        });
    }

    return (
        <div className={styles.cavasLayer}  ref={canvasRef}>
            {/**<div className={styles.textLayer}></div>**/}
        </div>
    );
}

export default Previewer;