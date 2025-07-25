import { themeConfig } from "@/config/app/global-conf";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { Extension } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import { yCollab } from "rdy-codemirror.next";
import {
  hightlightSelection,
  highlightUnselection,
} from "@/component/common/editor/foundation/extensions/highlight/highlight";
import { themeMap } from "@/component/common/editor/foundation/extensions/theme/theme";
import { language } from "./language";
import { autoComplete } from "./auto-complete";
import { docName } from './doc-name';

let curStart: number = 0;
let curEnd: number = 0;
let clearCount: number = 0;

const extensions = [
  EditorView.contentAttributes.of({ spellcheck: "true" }),
  EditorView.lineWrapping,
  EditorView.theme({
    "&": { height: "100%" },
    ".cm-content": {
      fontSize: "16px",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#A3BE8C",
    },
    ".cm-scroller": {},
    ".custom-tooltip": {
      backgroundColor: "#f0f0f0",
      color: "#333",
    },
  }),
  syntaxHighlighting(defaultHighlightStyle),
  EditorView.updateListener.of(function (e) {
    //  input/update/change event
    let selection = e.state.selection;
    let start = selection.ranges[0].from;
    let end = selection.ranges[0].to;
    if (start < end && (curStart !== start || curEnd !== end)) {
      clearCount = 0;
      curStart = start;
      curEnd = end;
      hightlightSelection(start, end);
    }
    if (start === end && clearCount < 2) {
      clearCount = clearCount + 1;
      highlightUnselection();
    }
  }),
];

export const createExtensions = (options: Record<string, any>): Extension[] => [
  basicSetup,
  yCollab(options.ytext, options.wsProvider.awareness, options.undoManager),
  extensions,
  themeConfig.of(themeMap.get("Solarized Light")!),
  docName("a.tex"),
  autoComplete({ autoComplete: true }),
  language("a.tex", options.metadata, false),
  // https://stackoverflow.com/questions/78011822/how-to-fix-the-codemirror-text-infilite-copy
  //highlight_extension
];
