import { LanguageSupport } from "@codemirror/language";
import { LaTeXLanguage } from "./latex-language";
import { CompletionSource } from "@codemirror/autocomplete";
import {
  argumentCompletionSources,
  beginEnvironmentCompletionSource,
  explicitCommandCompletionSource,
  inCommandCompletionSource,
} from "./complete";
import { openAutocomplete } from "./open-autocomplete";

const completionSources: CompletionSource[] = [
  ...argumentCompletionSources,
  inCommandCompletionSource,
  explicitCommandCompletionSource,
  beginEnvironmentCompletionSource,
];

export const latex = () => {
  let languageSupport = new LanguageSupport(LaTeXLanguage, [
    openAutocomplete(),
    ...completionSources.map((completionSource) =>
      LaTeXLanguage.data.of({
        autocomplete: completionSource,
      })
    ),
  ]);
  return languageSupport;
};
