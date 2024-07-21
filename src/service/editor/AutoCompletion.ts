import { CompletionContext } from "@codemirror/autocomplete";

/**
 * how to define the autocompletion popup style
 * https://discuss.codemirror.net/t/apply-custom-class-attribute-to-autocomplete-tooltip/4566
 * 
 * @param context 
 * @returns 
 */
export function texAutoCompletions(context: CompletionContext) {
    let word = context.matchBefore(/[\\w\\]+/);
    if (!word) return null;
    if (word.from === word.to && !context.explicit)
        return null
    return {
        from: word.from,
        options: [
            { label: "match", type: "keyword" },
            { label: "hello", type: "variable", info: "(World)" },
            { label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro" },
            { label: "\\begin{document}", type: "text", apply: "\begin{document}" },
            { label: "\\section", type: "text", apply: "\section" },
            { label: "\\subsection", type: "text", apply: "\subsection" },
        ]
    }
}

export const completionConfig = {
    override: [texAutoCompletions],
    tooltipClass: 'custom-tooltip',
};
