import React, { useRef, useState } from "react";
import { Page } from "react-pdf";
import styles from "./TeXPDFPage.module.css";
import { PageCallback } from "react-pdf/dist/shared/types";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import { useSelector } from "react-redux";
import { AppState } from "@/redux/types/AppState";
import { getCurPdfScale } from "@/service/project/preview/PreviewService";
import { PageViewport } from "pdfjs-dist";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import TeXPDFHighlight from "../feat/highlight/TeXPDFHighlight";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

interface PDFPageProps {
  index: number;
  style: React.CSSProperties;
  projId: string;
  width: number;
  height: number;
  viewPort: PageViewport;
  curPdfPosition: PdfPosition[] | undefined;
  viewModel: string;
}

const TeXPDFPage: React.FC<PDFPageProps> = ({
  index,
  style,
  projId,
  width,
  height,
  viewPort,
  curPdfPosition,
  viewModel,
}) => {
  let cachedScale = getCurPdfScale(projId, viewModel);
  const { projAttr } = useSelector((state: AppState) => state.proj);
  const canvasArray = useRef<
    Array<React.MutableRefObject<HTMLCanvasElement | null>>
  >([]);
  const [projAttribute, setProjAttribute] = useState<PreviewPdfAttribute>({
    pdfScale: cachedScale,
    legacyPdfScale: cachedScale,
  });
  const updateRefArray = (index: number, element: HTMLCanvasElement | null) => {
    if (element) {
      canvasArray.current[index] = { current: element };
    }
  };

  React.useEffect(() => {
    if (projAttr.pdfScale === 1 && cachedScale) {
      return;
    }
    setProjAttribute(projAttr);
  }, [projAttr, cachedScale]);

  const handlePageRenderSuccess = (page: PageCallback) => {};

  const handlePageChange = (page: any) => {};

  const removeTextLayerOffset = () => {
    const textLayers = document.querySelectorAll(
      ".react-pdf__Page__textContent"
    );
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.top = "0";
      style.left = "0";
      style.transform = "";
    });
  };

  return (
    <div
      id={"page-" + index}
      style={{
        ...style,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: `${projAttribute.pdfScale * width}`,
        left: `${
          ((width - projAttribute.pdfScale * width) * 100) / (2 * width)
        }%`,
      }}
    >
      <Page
        key={index + "@new-" + projAttribute.pdfScale}
        scale={projAttribute.pdfScale}
        className={styles.pdfPage}
        onLoad={handlePageChange}
        canvasRef={(element) => updateRefArray(index, element)}
        onChange={handlePageChange}
        onRenderSuccess={handlePageRenderSuccess}
        pageNumber={index}
        width={width}
        height={height}
        renderAnnotationLayer={true}
        renderTextLayer={true}
        onLoadSuccess={removeTextLayerOffset}
      >
        {curPdfPosition && viewPort ? (
          <TeXPDFHighlight
            position={curPdfPosition}
            pageNumber={index}
            viewport={viewPort}
          ></TeXPDFHighlight>
        ) : (
          <div></div>
        )}
      </Page>
    </div>
  );
};

export default TeXPDFPage;
