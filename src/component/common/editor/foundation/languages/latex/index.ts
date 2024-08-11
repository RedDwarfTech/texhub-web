import { LanguageSupport } from "@codemirror/language";
import { LaTeXLanguage } from "./latex-language";
import { CompletionSource } from "rdcodemirror-autocomplete";
import {
  CompletionContext
} from 'rdcodemirror-autocomplete';
import { Extension } from "@codemirror/state";

const simpleCompletionSource: CompletionSource = (context: CompletionContext) => {
  const suggestions = [
    "documentclass",
    "usepackage",
    "begin",
    "end",
    "section",
    "subsection"
  ];
  // 这里我们仅仅检查是否包含某个前缀，实际实现可以更复杂
  const word = context.matchBefore(/\w*/);
  if (!word) return null;

  return {
    from: word.from,
    options: suggestions.filter(s => s.startsWith(word.text)).map(s => ({
      label: s,
      type: "variable"
    }))
  };
};

export const openAutocomplete1 = () => simpleCompletionSource;

let autoCompleteExtension: Extension = LaTeXLanguage.data.of({
  autocomplete: openAutocomplete1(),
});

export const latex = () => {
  let languageSupport = new LanguageSupport(LaTeXLanguage, [
    autoCompleteExtension,
  ]);
  return languageSupport;
};