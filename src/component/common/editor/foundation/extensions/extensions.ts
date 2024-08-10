import { themeConfig } from "@/service/editor/CollarEditorService";
import { defaultHighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { EditorState } from "@codemirror/state";
import { Extension } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import { yCollab } from "y-codemirror.next";
import { hightlightSelection, highlightUnselection } from "@/component/common/editor/foundation/extensions/highlight/highlight";
import { themeMap } from "@/component/common/editor/foundation/extensions/theme/theme";
import { language } from './language';

let curStart: number = 0;
let curEnd: number = 0;
let clearCount: number = 0;

/**
     * https://stackoverflow.com/questions/78775280/how-to-tweak-the-codemirror6-autocompletion-popup-style
     * https://codemirror.net/docs/ref/#autocomplete.autocompletion^config.tooltipClass
     * @param state 
     * @returns 
     */
const ttc = (state: EditorState) => {
    return "custom-tooltip";
}

const extensions = [
  EditorView.contentAttributes.of({ spellcheck: 'true' }),
  EditorView.lineWrapping,
  EditorView.theme({
      "&": { height: "100%" },
      '.cm-content': {
          fontSize: '16px'
      },
      '.cm-selectionMatch': {
          backgroundColor: "#A3BE8C"
      },
      '.cm-scroller': {
      
      },
      '.custom-tooltip': {
          backgroundColor: "#f0f0f0",
          color: "#333"
      }
  }),
  StreamLanguage.define(stex),
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
          hightlightSelection(start, end)
      }
      if (start === end && clearCount < 2) {
          clearCount = clearCount + 1;
          highlightUnselection();
      }
  })
];

export const createExtensions = (options: Record<string, any>): Extension[] => [
  basicSetup,
  yCollab(options.ytext, options.wsProvider.awareness, options.undoManager),
  extensions,
  themeConfig.of(themeMap.get("Solarized Light")!),
  language(options.docName, options.metadata, true),
  // https://stackoverflow.com/questions/78011822/how-to-fix-the-codemirror-text-infilite-copy
  //highlight_extension
];


