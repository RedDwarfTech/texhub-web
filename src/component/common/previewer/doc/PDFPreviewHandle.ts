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

/**
     * Open pdf's link in the browser new tab
     * https://github.com/diegomura/react-pdf/issues/645
     * @param e
     */
export const openPdfUrlLink = (e: React.MouseEvent<HTMLDivElement>) => {
  e.preventDefault();
  if ((e.target as HTMLElement).tagName.toLowerCase() === "a") {
    window.open((e.target as HTMLAnchorElement).href);
  }
};
