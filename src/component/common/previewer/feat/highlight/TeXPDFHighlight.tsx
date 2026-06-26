import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { v4 as uuid } from 'uuid';
import { PageViewport } from 'pdfjs-dist';
import { pdfPositionToViewportRect } from "./HighlightUtil";

interface HighlightProps {
    position: PdfPosition[];
    pageNumber: number;
    viewport: PageViewport
}

const TeXPDFHighlight: React.FC<HighlightProps> = ({ position, pageNumber, viewport }) => {
    if (!position || position.length === 0) {
        return (<div></div>);
    }

    const renderArea = (position: PdfPosition[]) => {
        const highlightList: JSX.Element[] = [];
        position.forEach((item) => {
            if (item.page !== pageNumber || !viewport) {
                return;
            }
            const { left, top, width, height } = pdfPositionToViewportRect(item, viewport);
            highlightList.push(
                <div key={uuid()} style={{
                    position: 'absolute',
                    top,
                    left,
                    width,
                    height,
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
