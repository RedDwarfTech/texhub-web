import React, { useState } from 'react';
import styles from './Previewer.module.css';
import { toast } from 'react-toastify';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocumentProxy } from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

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

    const [pdfScale, setPdfScale] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    const options = {
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/cmaps/',
    };

    if (!props.pdfUrl) {
        return (<div>Loading</div>);
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

    const handleZoomIn = async () => {
        setPdfScale(pdfScale + 0.1);
    }

    const handleZoomOut = async () => {
        setPdfScale(pdfScale - 0.1);
    }

    const onDocumentLoadSuccess = (pdf: any) => {
        const { doc, numPages } = pdf;
        setNumPages(numPages);
    }

    const renderPages =(totalPageNum: number|undefined) => {
        if(!totalPageNum || totalPageNum<1) return;
        const tagList: JSX.Element[] = [];
        for(let i = 1; i <= totalPageNum; i++){
            tagList.push(<Page key={i} className={styles.pdfPage} scale={pdfScale} pageNumber={i} />);
        }
        return tagList;
    }

    return (
        <div id="preview" className={styles.preview}>
            <div className={styles.previewHader}>
                <button onClick={() => { handleDownloadPdf(props.pdfUrl) }}>下载PDF</button>
                <button id="zoominbutton" onClick={() => { handleZoomIn() }}>放大</button>
                <button id="zoomoutbutton" onClick={() => { handleZoomOut() }}>缩小</button>
            </div>
            <div className={styles.previewBody}>
                <Document options={options} file={props.pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                    {renderPages(numPages)}
                </Document>
            </div>
            <div className={styles.previewFooter}>
                <p>
                    Page {pageNumber} of {numPages}
                </p>
            </div>
        </div>
    );
}

export default Previewer;