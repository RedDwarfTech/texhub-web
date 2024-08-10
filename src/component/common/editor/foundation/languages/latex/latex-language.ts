import { LRLanguage } from "@codemirror/language";
import { parser } from "../../extensions/lezer-latex/latex.mjs";

export const LaTeXLanguage = LRLanguage.define({
    name: 'latex',
    parser: parser.configure({
        props: []
    }),
    languageData: {
        commentTokens: { line: '%' }
    }
});