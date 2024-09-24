import { VariableSizeList } from "react-window";

export interface PDFPreviewProps {
  curPdfUrl: string;
  projId: string;
  viewModel: string;
  setPageNum: (page: number) => void;
  virtualListRef: React.RefObject<VariableSizeList>;
}