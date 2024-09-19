import { PreviewActionType } from "@/redux/action/project/preview/PreviewAction";
import { XHRClient } from "rd-component";
import store from "@/redux/store/store";
import { readConfig } from "@/config/app/config-reader";
import { BaseMethods } from "rdjs-wheel";

export function setCurPdfPage(pageNo: number, projId: string) {
  const actionTypeString: string =
    PreviewActionType[PreviewActionType.SET_CUR_PAGE];
  localStorage.setItem(readConfig("pdfCurPage") + projId, pageNo.toString());
  if (pageNo < 100) {
    
  }
  return XHRClient.dispathAction(pageNo, actionTypeString, store);
}

export function getCurPdfPage(projId: string) {
  if(BaseMethods.isNull(projId)) {
    return 0;
  }
  let curPage = localStorage.getItem(readConfig("pdfCurPage") + projId);
  if (curPage) {
    return Number(curPage);
  }else{
    return 0;
  }
}

export function setCurPdfScrollOffset(scrollOffset: number, projId: string) {
  const key = readConfig("pdfScrollKey") + projId;
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

export function getCurPdfScrollOffset(projId: string) {
  const key = readConfig("pdfScrollKey") + projId;
  let offset = localStorage.getItem(key);
  if (offset) {
    return Number(offset);
  } else {
    return 0;
  }
}
