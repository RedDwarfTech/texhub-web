import { DocumentCallback, Options } from "react-pdf/dist/shared/types";
import { ListImperativeAPI } from "react-window";

export interface PDFPreviewProps {
  curPdfUrl: string;
  projId: string;
  viewModel: string;
  setPageNum: (page: number) => void;
  virtualListRef: React.RefObject<ListImperativeAPI>;
  pdfOptions: Options;
  curPdfPage?: number;
  onOutlineLoaded?: (outline: any[]) => void;
  onPdfLoaded?: (pdf: DocumentCallback) => void;
}