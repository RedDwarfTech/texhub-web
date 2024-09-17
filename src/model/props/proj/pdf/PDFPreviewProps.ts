import { VariableSizeList } from "react-window";
import { Options } from "react-pdf/dist/cjs/shared/types";

export interface PDFPreviewProps {
  curPdfUrl: string;
  projId: string;
  options: Options;
  viewModel: string;
  setPageNum: (page: number) => void;
  virtualListRef: React.RefObject<VariableSizeList>;
}