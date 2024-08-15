import {
  Completion,
  CompletionContext,
  snippet,
  snippetCompletion,
} from "@codemirrir/autocomplete";
import { EditorView } from "codemirror";

/**
 * how to define the autocompletion popup style
 * https://discuss.codemirror.net/t/apply-custom-class-attribute-to-autocomplete-tooltip/4566
 *
 * @param context
 * @returns
 */
export function texAutoCompletions(context: CompletionContext) {
  let word = context.matchBefore(/\\[\w\\]*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      snippetCompletion("\\begin{#{1}}", {
        label: "\\begin{}",
        type: "text",
        detail: "env",
      }),
      { label: "\\section{}", type: "text", apply: "\\section{}" },
      { label: "\\subsection{}", type: "text", apply: "\\subsection{}" },
      { label: "\\usepackage{}", type: "text", apply: "\\usepackage{}" },
      { label: "\\footnote{}", type: "text", apply: "\\footnote{}" },
    ],
  };
}

export const dom1 = () => {
  var d = document.createElement("div");
  d.innerText = "dd";
  return d;
};

export const completionConfig = {
  override: [texAutoCompletions],
  tooltipClass: "custom-tooltip",
};
