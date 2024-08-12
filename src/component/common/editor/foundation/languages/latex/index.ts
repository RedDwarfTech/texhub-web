import { LanguageSupport } from "@codemirror/language";
import { LaTeXLanguage } from "./latex-language";
import { CompletionSource } from "rdcodemirror-autocomplete";
import { inCommandCompletionSource } from "./complete";

const completionSources: CompletionSource[] = [
  inCommandCompletionSource,
];

export const latex = () => {
  let languageSupport = new LanguageSupport(LaTeXLanguage, [
    ...completionSources.map(completionSource =>
      LaTeXLanguage.data.of({
        autocomplete: completionSource,
      })
    ),
  ]);
  return languageSupport;
};