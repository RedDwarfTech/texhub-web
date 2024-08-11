import { LanguageSupport } from "@codemirror/language";
import { LaTeXLanguage } from "./latex-language";
import { CompletionSource } from "rdcodemirror-autocomplete";
import { inCommandCompletionSource } from "./complete";

const completionSources: CompletionSource[] = [inCommandCompletionSource];

export const latex = () => {
  let ls = new LanguageSupport(LaTeXLanguage, [
    ...completionSources.map((completionSource) => {
      debugger;
      return LaTeXLanguage.data.of({
        autocomplete: completionSource,
      });
    }),
  ]);
  debugger;
  return ls;
};
