import React, { useState } from 'react';
import { Document, Page,pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export type ViewerProps = {
    pdfUrl: string | undefined;
};

const RdViewer: React.FC<ViewerProps> = (props: ViewerProps) => {

    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    const onDocumentLoadSuccess = () =>{
        setNumPages(1);
    }

    return (
        <div>
            <Document file={props.pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
            </Document>
            <p>
                Page {pageNumber} of {numPages}
            </p>
        </div>
    );
}

export default RdViewer;