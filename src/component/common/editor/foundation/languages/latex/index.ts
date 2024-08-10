import { LanguageSupport } from "@codemirror/language";
import { LaTeXLanguage } from './latex-language';
import { CompletionSource } from "rdcodemirror-autocomplete";
import {
    inCommandCompletionSource,
  } from './complete';

const completionSources: CompletionSource[] = [
    inCommandCompletionSource
];

export const latex  = () => {
    return new LanguageSupport(LaTeXLanguage, [
        ...completionSources.map(completionSource => 
            LaTeXLanguage.data.of({
                autocomplete: completionSource
            })
        ),
    ]);
}

