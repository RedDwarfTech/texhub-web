import { ListImperativeAPI } from "react-window";
import styles from "./MemoizedPDFPreview.module.css";
import { getCurPdfScrollOffset, setCurPdfScrollOffset } from "@/service/project/preview/PreviewService";

/**
 * 程序滚动守卫：用于区分“用户手动滚动”与“程序自动滚动”。
 *
 * 原生 scroll 事件无法直接区分来源（程序 scrollTo 与用户滚轮最终都
 * 由浏览器派发真实 scroll 事件，isTrusted 均为 true），因此在所有
 * 程序触发滚动的位置（scrollToPage / scrollToOffset 等）先调用
 * markProgrammaticScroll() 打时间戳标记，消费方（onRowsRendered /
 * 滚动同步 effect）在标记窗口内即可判定本次滚动为程序触发。
 */
let programmaticScrollTimestamp = 0;

/** 标记一次程序触发的滚动 */
export function markProgrammaticScroll(): void {
  programmaticScrollTimestamp = Date.now();
}

/**
 * 判断最近一次滚动是否由程序触发。
 * @param withinMs 判定窗口，默认 500ms
 */
export function isProgrammaticScroll(withinMs = 500): boolean {
  return Date.now() - programmaticScrollTimestamp < withinMs;
}

export const goPage = (i: number) => {
  let element = document.querySelectorAll(`.${styles.pdfPage}`);
  if (element && element.length > 0 && i) {
    element[i - 1]!.scrollIntoView({ behavior: "smooth" });
  }
};

export const scrollToPage = (
  pageIndex: number,
  virtualListRef: React.RefObject<ListImperativeAPI>,
  align: "auto" | "smart" | "center" | "end" | "start" = "center"
) => {
  if (virtualListRef.current) {
    // list index starts from 0 while page starts from 1
    markProgrammaticScroll();
    virtualListRef.current.scrollToRow({ index: pageIndex - 1, align });
  }
};

export const scrollToOffset = (
  offset: number,
  virtualListRef: React.RefObject<ListImperativeAPI>,
  projId: string
) => {
  if (virtualListRef.current) {
    markProgrammaticScroll();
    if (virtualListRef.current.element) {
      virtualListRef.current.element.scrollTop = offset;
    }
    setCurPdfScrollOffset(
      offset,
      projId,
      "project attribute update"
    );
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
  virtualListRef: React.RefObject<ListImperativeAPI>
) => {
  if (virtualListRef.current) {
    let fullScreenOffset = getCurPdfScrollOffset(projId);
    if (fullScreenOffset) {
      scrollToOffset(fullScreenOffset, virtualListRef,projId);
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

export const enterFullScreen = () => {
  const divElement: any = document.getElementById("pdfContainer");
  if (!divElement) {
    return;
  }
  if (divElement.requestFullscreen) {
    divElement.requestFullscreen();
  } else if (divElement.mozRequestFullScreen) {
    // Firefox
    divElement.mozRequestFullScreen();
  } else if (divElement.webkitRequestFullscreen) {
    // Safari
    divElement.webkitRequestFullscreen();
  } else if (divElement.msRequestFullscreen) {
    // IE/Edge
    divElement.msRequestFullscreen();
  }
};