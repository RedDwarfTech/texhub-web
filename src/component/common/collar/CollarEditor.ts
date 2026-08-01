import { BaseMethods } from "rdjs-wheel";
import { EditorView } from "./collar.js";
import { Annotation } from "@codemirror/state";
import * as Y from "yjs";
import { ySyncFacet } from "y-codemirror.next";

const ySyncAnnotation = Annotation.define();

export const updateEditor = (
  tr: Y.Transaction,
  event: Y.YTextEvent,
  doc: Y.Doc,
  editorView: EditorView
) => {
  console.log("updateEditor subdocument " + doc.guid + " observed:", doc.guid);
  if (!editorView || BaseMethods.isNull(editorView)) {
    console.error("EditorView is null:", editorView);
    return;
  }
  let conf = editorView.state.facet(ySyncFacet);
  const delta = event.delta;
  const changes = [];
  let pos = 0;
  for (let i = 0; i < delta.length; i++) {
    const d = delta[i];
    if (d.insert != null) {
      changes.push({ from: pos, to: pos, insert: d.insert });
    } else if (d.delete != null) {
      changes.push({ from: pos, to: pos + d.delete, insert: "" });
      pos += d.delete;
    } else {
      pos += d.retain!;
    }
  }
  if (changes.length === 0) {
    console.warn("No changes found in the delta.");
    return;
  }
  editorView.dispatch({
    // @ts-ignore
    changes,
    annotations: [ySyncAnnotation.of(conf)],
  });
};