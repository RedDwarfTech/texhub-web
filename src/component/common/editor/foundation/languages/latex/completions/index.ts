import { buildBibliographyStyleCompletions } from "./bibliography-styles";
import { buildClassCompletions } from "./classes";
import { buildEnvironmentCompletions } from "./environments";
import { buildIncludeCompletions } from "./include";
import { buildLabelCompletions } from "./labels";
import { buildPackageCompletions } from "./packages";
import { buildReferenceCompletions } from "./references";
import { buildSnippetCompletions } from "./snippets";
import { Completions } from "./types";
import { CompletionContext } from "@codemirror/autocomplete";

export const buildAllCompletions = (
  completions: Completions,
  context: CompletionContext
) => {
  buildSnippetCompletions(completions);
  buildEnvironmentCompletions(completions);
  buildClassCompletions(completions);
  buildBibliographyStyleCompletions(completions);
  buildIncludeCompletions(completions, context);
  buildReferenceCompletions(completions, context);
  buildLabelCompletions(completions, context);
  buildPackageCompletions(completions, context);
  return completions;
};
