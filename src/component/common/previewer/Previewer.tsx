import React, { useState } from 'react';
import styles from './Previewer.module.css';
import { toast } from 'react-toastify';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

export type ViewerProps = {
    pdfUrl: string | undefined;
};

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
        <div id="preview" className={styles.preview}>
            <div className={styles.previewHader}>
                <div className={styles.leftAction}>
                    <button className={styles.previewButton}>
                        <i className="fa-regular fa-file-pdf"></i> 预览
                    </button>
                    <button className={styles.previewButton}>
                        <i className="fa-regular fa-file-lines"></i> 日志
                    </button>
                </div>
                <div className={styles.rightAction}>
                    <button className={styles.previewIconButton} onClick={() => { handleDownloadPdf(props.pdfUrl) }}>
                        <i className="fa-solid fa-download"></i>
                    </button>
                    <button className={styles.previewIconButton} id="zoominbutton" onClick={() => { handleZoomIn() }}>
                        <i className="fa fa-search-plus"></i>
                    </button>
                    <button className={styles.previewIconButton} id="zoomoutbutton" onClick={() => { handleZoomOut() }}>
                        <i className="fa fa-search-minus"></i>
                    </button>
                </div>
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