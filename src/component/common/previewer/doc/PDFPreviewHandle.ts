import { VariableSizeList } from "react-window";
import styles from "./MemoizedPDFPreview.module.css";
import { readConfig } from "@/config/app/config-reader";
import { getCurPdfScrollOffset } from "@/service/project/preview/PreviewService";

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
    console.warn("trigger scrolltooffset:" + offset);
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
    let fullScreenOffset = getCurPdfScrollOffset(projId, viewModel);
    if (fullScreenOffset) {
      scrollToOffset(fullScreenOffset, virtualListRef);
    }
  }
};

export const isMoreThanFiveSeconds = (strDate: string) => {
  const targetDate = Number(strDate);
  const currentDate: Date = new Date();
  const diffInMilliseconds: number = currentDate.getTime() - targetDate;
  if (diffInMilliseconds > 5000) {
    return true;
  } else {
    return false;
  }
};
