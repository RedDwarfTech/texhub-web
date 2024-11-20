import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { v4 as uuid } from 'uuid';
import { PageViewport } from 'pdfjs-dist';

interface HighlightProps {
    position: PdfPosition[];
    pageNumber: number;
    viewport: PageViewport
}

const TeXPDFHighlight: React.FC<HighlightProps> = ({ position, pageNumber, viewport }) => {
    if (!position || position.length === 0) {
        return (<div></div>);
    }
    const pdfToViewport = (pdfPosition: PdfPosition, viewport: PageViewport) => {
        const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
            pdfPosition.h,
            pdfPosition.v,
            pdfPosition.x,
            pdfPosition.y,
        ]);
        return {
            left: Math.min(x1, x2),
            top: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y1 - y2),
            pageNumber: pdfPosition.page,
        };
    };

    const renderArea = (position: PdfPosition[]) => {
        const highlightList: JSX.Element[] = [];
        position.forEach((item) => {
            if (item.page !== pageNumber || !viewport) {
                return;
            }
            let viewPort = pdfToViewport(item, viewport);
            let lineHeight = item.height * viewport.scale;
            highlightList.push(
                <div key={uuid()} style={{
                    position: 'absolute',
                    top: viewport.height - viewPort.top - lineHeight,
                    left: viewPort.left,
                    width: item.width * viewport.scale,
                    height: lineHeight,
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

export default TeXPDFHighlight;