import { Options } from "react-pdf/dist/shared/types";
import { VariableSizeList } from "react-window";

export interface PDFPreviewProps {
  curPdfUrl: string;
  projId: string;
  viewModel: string;
  setPageNum: (page: number) => void;
  virtualListRef: React.RefObject<VariableSizeList>;
  pdfOptions: Options,
  curPdfPage?: number,
}