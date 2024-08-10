import { buildPackageCompletions } from "./packages";
import { Completions } from "./types";
import { CompletionContext } from "rdcodemirror-autocomplete";

export const buildAllCompletions = (
  completions: Completions,
  context: CompletionContext
) => {
  buildPackageCompletions(completions, context);
  return completions;
};
