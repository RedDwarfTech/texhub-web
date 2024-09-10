import React from "react";
import { VariableSizeList as List } from "react-window";
import { Document } from "react-pdf";

const PDFPreview: React.FC = React.memo(({}) => {
  const Row = ({ index, style }: { index: any; style: any }) => (
    <div style={style}>Row</div>
  );

  const getPageHeight = (pageIndex: number) => {
   debugger
    return 200;
  };

  return (
    <div id="pdfContainer">
      <Document file="lshort-zh-cn.pdf">
            {getPageHeight(1)}
      </Document>
    </div>
  );
},(prevProps, nextProps) => {
  return true;
});

export default PDFPreview;
