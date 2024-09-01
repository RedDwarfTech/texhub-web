import { base64ToUint8Array } from "@/common/ConvertUtil";
import * as Y from "yjs";
import { UndoManager } from "yjs";
import { encodeStateAsUpdate } from "yjs";
import { encodeStateVector } from "yjs";
import { applyUpdate } from "yjs";
import { Doc } from "yjs";

const snapshotOrigin = "snapshot-origin";

export const createDocFromSnapshot = (snapshotBase64: string): Y.Doc => {
  // Decode the Base64 snapshot
  const snapshotUint8Array = base64ToUint8Array(snapshotBase64);
  // Create a new Y.Doc instance
  const ydoc = new Y.Doc();
  // Apply the snapshot to the new document
  const snapshot = Y.decodeSnapshot(snapshotUint8Array);
  //ydoc.loadSnapshot(snapshot);
  return ydoc;
};

export function getDocDiff(ydoc: Y.Doc, decoded: Y.Snapshot) {
  try {
    const doc = new Y.Doc({ gc: false });
    const docRestored = Y.createDocFromSnapshot(doc, decoded);
    const stateVector = Y.encodeStateVector(docRestored);
    const diff: Uint8Array = Y.encodeStateAsUpdate(ydoc, stateVector);
    if (diff.length > 0) {
      let content = String.fromCharCode(...new Uint8Array(diff));
      console.log("diff content", content);
    }
  } catch (e) {}
}

/**
 * https://discuss.yjs.dev/t/how-to-recover-to-the-specified-version/2301/7
 */
export function revertUpdate(
  doc: Doc,
  snapshotUpdate: Uint8Array,
  getMetadata: (key: string) => "Text" | "Map" | "Array"
) {
  const snapshotDoc = new Doc();
  applyUpdate(snapshotDoc, snapshotUpdate, snapshotOrigin);

  const currentStateVector = encodeStateVector(doc);
  const snapshotStateVector = encodeStateVector(snapshotDoc);

  const changesSinceSnapshotUpdate = encodeStateAsUpdate(
    doc,
    snapshotStateVector
  );
  const undoManager = new UndoManager(
    [...snapshotDoc.share.keys()].map((key) => {
      const type = getMetadata(key);
      if (type === "Text") {
        return snapshotDoc.getText(key);
      } else if (type === "Map") {
        return snapshotDoc.getMap(key);
      } else if (type === "Array") {
        return snapshotDoc.getArray(key);
      }
      throw new Error("Unknown type");
    }),
    {
      trackedOrigins: new Set([snapshotOrigin]),
    }
  );
  applyUpdate(snapshotDoc, changesSinceSnapshotUpdate, snapshotOrigin);
  undoManager.undo();
  const revertChangesSinceSnapshotUpdate = encodeStateAsUpdate(
    snapshotDoc,
    currentStateVector
  );
  applyUpdate(doc, revertChangesSinceSnapshotUpdate, snapshotOrigin);
}
