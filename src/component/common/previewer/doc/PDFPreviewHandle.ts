import { VariableSizeList } from "react-window";
import styles from "./MemoizedPDFPreview.module.css";
import { readConfig } from "@/config/app/config-reader";

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
    // the VariableSizeList index was started by 0
    // the page size start by 1
    virtualListRef.current.scrollToItem(pageIndex - 1, "center");
  }
};

export const scrollToOffset = (
  offset: number,
  virtualListRef: React.RefObject<VariableSizeList>
) => {
  if (virtualListRef.current) {
    virtualListRef.current.scrollTo(offset);
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

export const restorePdfOffset = (
  projId: string,
  viewModel: string,
  virtualListRef: React.RefObject<VariableSizeList>
) => {
  if (virtualListRef.current) {
    const key = viewModel + ":" + readConfig("pdfScrollKey") + projId;
    let fullScreenOffset = localStorage.getItem(key);
    if (fullScreenOffset) {
      console.log("trigger restore offset");
      scrollToOffset(parseInt(fullScreenOffset), virtualListRef);
    }
  }
};
