import { buildPackageCompletions } from "./packages";
import { buildSnippetCompletions } from "./snippets";
import { Completions } from "./types";
import { CompletionContext } from "@codemirror/autocomplete";

export const buildAllCompletions = (
  completions: Completions,
  context: CompletionContext
) => {
  buildSnippetCompletions(completions)
  buildPackageCompletions(completions, context);
  return completions;
};
