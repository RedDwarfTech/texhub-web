import { PreviewActionType } from "@/redux/action/project/preview/PreviewAction";
import { XHRClient } from "rd-component";
import store from "@/redux/store/store";
import { readConfig } from "@/config/app/config-reader";
import { BaseMethods } from "rdjs-wheel";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { OutlineItemRaw } from "@/component/common/previewer/feat/outline/outlineNavigation";
import {
  PdfActiveOutline,
  PdfOutlineNavRequest,
} from "@/model/proj/pdf/PdfOutlineNavRequest";

export function setCurPdfScale(
  scale: number,
  projId: string,
  viewModel: string
) {
  // Ensure scale is valid (not NaN, not infinite, and positive)
  if (isNaN(scale) || !isFinite(scale) || scale <= 0) {
    console.warn(`Invalid PDF scale ${scale}, setting to default 1`);
    scale = 1;
  }
  let pdfScaleKey = viewModel + ":pdf:scale:" + projId;
  localStorage.setItem(pdfScaleKey, scale.toString());
}

export function getCurPdfScale(projId: string, viewModel: string) {
  let pdfScaleKey = viewModel + ":pdf:scale:" + projId;
  let curScale = localStorage.getItem(pdfScaleKey);
  if (curScale) {
    const scale = Number(curScale);
    // Ensure scale is valid and not too small
    return Math.max(scale, 0.1);
  } else {
    return 1;
  }
}

export function setAndDispatchPdfPage(pageNo: number, projId: string, src: string) {
  const actionTypeString: string =
    PreviewActionType[PreviewActionType.SET_CUR_PAGE];
  localStorage.setItem(readConfig("pdfCurPage") + projId, pageNo.toString());
  return XHRClient.dispathAction(pageNo, actionTypeString, store);
}

export function setFullscreenFlag(fullscreen: boolean) {
  const actionTypeString: string =
    PreviewActionType[PreviewActionType.SET_FULLSCREEN_FLAG];
  return XHRClient.dispathAction(fullscreen, actionTypeString, store);
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
  src: string
) {
  const key = readConfig("pdfScrollKey") + projId;
  localStorage.setItem(key, scrollOffset.toString());
}

/**
 * 全屏刷新恢复：按 viewModel 隔离记录当前标签页的滚动 offset。
 *
 * 用 sessionStorage 区分「新开全屏」与「刷新」：
 *  - sessionStorage 随 window.open 克隆到新标签页，因此必须带上
 *    viewModel 前缀，避免新开全屏时误用编辑器标签页的 offset；
 *  - 同一标签页内刷新时，fullscreen 自己的 offset 仍在，可精确还原。
 */
export function setCurPdfScrollOffsetSession(
  scrollOffset: number,
  projId: string,
  viewModel: string
) {
  const key = viewModel + ":" + readConfig("pdfScrollKey") + projId;
  sessionStorage.setItem(key, scrollOffset.toString());
}

export function getCurPdfScrollOffsetSession(
  projId: string,
  viewModel: string
) {
  const key = viewModel + ":" + readConfig("pdfScrollKey") + projId;
  let offset = sessionStorage.getItem(key);
  if (offset) {
    return Number(offset);
  } else {
    return 0;
  }
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

/**
 * at first time, we seperate the pdf full screen scroll location with preview 
 * when we using the TeXHub, it seems fullscreen view use the same pdf scroll location are efficient
 * so we remove the viewModel parameters
 * 
 * @param projId 
 * @param viewModel 
 * @returns 
 */
export function getCurPdfScrollOffset(projId: string) {
  const key = readConfig("pdfScrollKey") + projId;
  let offset = localStorage.getItem(key);
  if (offset) {
    return Number(offset);
  } else {
    return 0;
  }
}

export function setContextCompileResultType(compResult: CompileResultType) {
  const actionTypeString: string =
  PreviewActionType[PreviewActionType.SET_COMPILE_RESULT_TYPE];
  return XHRClient.dispathAction(compResult, actionTypeString, store);
}

export function setAndDispatchPdfOutline(outline: OutlineItemRaw[]) {
  const actionTypeString: string =
    PreviewActionType[PreviewActionType.SET_PDF_OUTLINE];
  return XHRClient.dispathAction(outline, actionTypeString, store);
}

export function requestOutlineNavigation(
  dest: unknown,
  key?: string,
  ancestorKeys: string[] = []
) {
  const payload: PdfOutlineNavRequest = {
    dest,
    id: Date.now(),
    key,
    ancestorKeys,
  };
  const actionTypeString: string =
    PreviewActionType[PreviewActionType.REQUEST_OUTLINE_NAV];
  return XHRClient.dispathAction(payload, actionTypeString, store);
}

export function setAndDispatchActiveOutline(active: PdfActiveOutline) {
  const actionTypeString: string =
    PreviewActionType[PreviewActionType.SET_ACTIVE_OUTLINE];
  return XHRClient.dispathAction(active, actionTypeString, store);
}