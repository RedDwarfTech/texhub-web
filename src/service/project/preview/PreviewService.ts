import { PreviewActionType } from "@/redux/action/project/preview/PreviewAction";
import { XHRClient } from "rd-component";
import store from "@/redux/store/store";
import { readConfig } from "@/config/app/config-reader";
import { BaseMethods } from "rdjs-wheel";

export function setCurPdfScale(
  scale: number,
  projId: string,
  viewModel: string
) {
  let pdfScaleKey = viewModel + ":pdf:scale:" + projId;
  localStorage.setItem(pdfScaleKey, scale.toString());
}

export function getCurPdfScale(projId: string, viewModel: string) {
  let pdfScaleKey = viewModel + ":pdf:scale:" + projId;
  let curScale = localStorage.getItem(pdfScaleKey);
  if (curScale) {
    return Number(curScale);
  } else {
    return 1;
  }
}

export function setCurPdfPage(pageNo: number, projId: string, src: string) {
  console.warn("update pageno:" + pageNo + ",src: " + src);
  const actionTypeString: string =
    PreviewActionType[PreviewActionType.SET_CUR_PAGE];
  localStorage.setItem(readConfig("pdfCurPage") + projId, pageNo.toString());
  return XHRClient.dispathAction(pageNo, actionTypeString, store);
}

export function setDocLoadTime() {
  localStorage.setItem("docLoadTime", new Date().getTime().toString());
}

export function getCurPdfPage(projId: string) {
  if (BaseMethods.isNull(projId)) {
    return 0;
  }
  let curPage = localStorage.getItem(readConfig("pdfCurPage") + projId);
  if (curPage) {
    return Number(curPage);
  } else {
    return 0;
  }
}

/**
 *
 * @param scrollOffset
 * @param projId
 */
export function setCurPdfScrollOffset(
  scrollOffset: number,
  projId: string,
  viewModel: string,
  src: string
) {
  const key = viewModel + ":" + readConfig("pdfScrollKey") + projId;
  console.warn("offsetChanged," + scrollOffset + " src: " + src);
  localStorage.setItem(key, scrollOffset.toString());
}

export function scaleCurPdfScrollOffset(scale: number, projId: string) {
  const key = readConfig("pdfScrollKey") + projId;
  let offset = localStorage.getItem(key);
  if (offset) {
    let newOffset = Number(offset) * scale;
    localStorage.setItem(key, newOffset.toString());
  } else {
    return 0;
  }
}

export function getCurPdfScrollOffset(projId: string, viewModel: string) {
  const key = viewModel + ":" + readConfig("pdfScrollKey") + projId;
  let offset = localStorage.getItem(key);
  if (offset) {
    return Number(offset);
  } else {
    return 0;
  }
}
