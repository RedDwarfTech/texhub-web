import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { v4 as uuid } from 'uuid';
import { PageViewport } from 'pdfjs-dist';

interface HighlightProps {
    position: PdfPosition[];
    pageNumber: number;
    viewport: PageViewport
}

const Highlight: React.FC<HighlightProps> = ({ position, pageNumber, viewport }) => {
    if (!position || position.length == 0) {
        return (<div></div>);
    }
    const pdfToViewport = (pdf: PdfPosition, viewport: PageViewport) => {
        const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
            pdf.h,
            pdf.v,
            pdf.x,
            pdf.y,
        ]);
        const height = Math.abs(y1 - y2);
        return {
            left: Math.min(x1, x2),
            top: Math.min(y1, y2) - height,
            width: Math.abs(x2 - x1),
            height: height,
            pageNumber: pdf.page,
        };
    };

    const renderArea = (position: PdfPosition[]) => {
        const highlightList: JSX.Element[] = [];
        position.forEach((item) => {
            if (item.page !== pageNumber || !viewport) {
                return;
            }
            let p = pdfToViewport(item, viewport);
            highlightList.push(
                <div key={uuid()} style={{
                    position: 'absolute',
                    top: viewport.height - p.top,
                    left: p.left,
                    width: item.width * viewport.scale,
                    height: item.height * viewport.scale,
                    backgroundColor: 'rgba(255, 226, 143, 1)',
                    transition: 'background 0.3s',
                    opacity: 0.5,
                }}></div>
            );
        });
        return highlightList;
    }

    return (
        <div>
            {renderArea(position)}
        </div>
    );
}

export default Highlight;