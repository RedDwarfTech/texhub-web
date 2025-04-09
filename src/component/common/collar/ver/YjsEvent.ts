import { base64ToUint8Array } from "@/common/ConvertUtil";
import { TexFileVersion } from "@/model/file/TexFileVersion";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { addFileVersion } from "@/service/file/FileService";
import lodash from "lodash";
import * as Y from "rdyjs";
import { getDocDiff } from "@/component/common/collar/ver/YjsFunc";


export const handleYDocUpdate = (
  editorAttr: EditorAttr,
  ytext: Y.Text,
  ydoc: Y.Doc
) => {
  try {
    let snapshot: Y.Snapshot = Y.snapshot(ydoc);
    let snap: Uint8Array = Y.encodeSnapshot(snapshot);
    // https://discuss.yjs.dev/t/save-the-yjs-snapshot-to-database/2317
    let content = String.fromCharCode(...new Uint8Array(snap));
    let snapBase64 = btoa(content);
    let lastsnapshot = localStorage.getItem("lastsnapshot");
    if (snapBase64 === lastsnapshot) {
      // never run into this
      return;
    }
    if (lastsnapshot) {
      let cached: Uint8Array = base64ToUint8Array(lastsnapshot);
      const decoded: Y.Snapshot = Y.decodeSnapshot(cached);
      getDocDiff(ydoc,decoded);
      let equal = Y.equalSnapshots(decoded, snapshot);
      if (equal) {
        // never run into this
        return;
      }
    }
    let editorText = ytext.toString();
    let lasteditortext = localStorage.getItem("lasteditortext");
    if (lasteditortext === editorText) {
      // will run into this
      return;
    }
    let params: TexFileVersion = {
      file_id: editorAttr.docId,
      name: editorAttr.name,
      project_id: editorAttr.projectId,
      content: editorText,
      action: 1,
      snapshot: snapBase64,
    };
    // https://discuss.yjs.dev/t/is-it-possible-to-detect-the-document-changed-or-not/2453
    localStorage.setItem("lastsnapshot", snapBase64);
    localStorage.setItem("lasteditortext", editorText);
    throttledFn(params);
  } catch (e) {
    console.error(e);
  }
};

export const handleYDocUpdateDiff = (
  editorAttr: EditorAttr,
  ytext: Y.Text,
  ydoc: Y.Doc
) => {
  try {
    let snapshot: Y.Snapshot = Y.snapshot(ydoc);
    let snap: Uint8Array = Y.encodeSnapshot(snapshot);
    // 历史的状态向量
    const stateVector: Uint8Array = Y.encodeStateVector(ydoc);
    // 和最新记录做差量，得到差量的 UInt8Array
    const diff: Uint8Array = Y.encodeStateAsUpdate(ydoc, stateVector);
    //如果差量大于0，写入数据库，并将上次记录更新到最新版本
    if (diff.length > 0) {
      // 保存到数据库 historyUpdate是新增的方法，和storeUpdate差不多，
      // 只是记录历史到新表docName+'-history‘，保存的数据结构为docName表加一个字段time
      // ldb!.historyUpdate(docName, diff);
      // 将上次记录更新到最新版本
      // Y.applyUpdate(_historyDoc, diff);
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * 创建一个节流函数，在 wait 秒内最多执行 func 一次的函数。
 * 首次调用执行一次，一定时间内再次调用，不再执行。
 * debounce （函数去抖） 多次触发，只在最后一次触发时，执行目标函数。
 */
const throttledFn = lodash.throttle((params: TexFileVersion) => {
  addFileVersion(params);
}, 10000);
export { getDocDiff };

