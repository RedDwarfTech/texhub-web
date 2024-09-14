import { VariableSizeList } from "react-window";
import styles from "./MemoizedPDFPreview.module.css";

export const goPage = (i: number) => {
  let element = document.querySelectorAll(`.${styles.pdfPage}`);
  if (element && element.length > 0 && i) {
    element[i - 1]!.scrollIntoView({ behavior: "smooth" });
  }
};

export const scrollToPage = (
  pageIndex: number,
  virtualListRef: React.RefObject<VariableSizeList>
) => {
  if (virtualListRef.current) {
    virtualListRef.current.scrollToItem(pageIndex - 1);
  }
};
