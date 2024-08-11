import { CompletionContext, CompletionSource } from "rdcodemirror-autocomplete";
import { ifInType } from "../../utils/tree-query";
import { Completions } from "./completions/types";
import { buildAllCompletions } from "./completions";

function blankCompletions(): Completions {
  return {
    bibliographies: [],
    bibliographyStyles: [],
    classes: [],
    commands: [],
    graphics: [],
    includes: [],
    labels: [],
    packages: [],
    references: [],
  };
}

export const inCommandCompletionSource: CompletionSource = ifInType(
  "$CtrlSeq",
  (context) => {
    return commandCompletionSource(context);
  }
);

export const commandCompletionSource = (context: CompletionContext) => {
  let word = context.matchBefore(/\w*/)!;
  if (word.from === word.to && !context.explicit)
    return null
  return {
    from: word.from,
    options: [
      {label: "match", type: "keyword"},
      {label: "hello", type: "variable", info: "(World)"},
      {label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro"}
    ]
  }
};

export function getCompletionMatches(context: CompletionContext) {
  // NOTE: [^\\] is needed to match commands inside the parameters of other commands
  const matchBefore = context.explicit
    ? context.matchBefore(/(?:^|\\)[^\\]*(\[[^\]]*])?[^\\]*/) // don't require a backslash if opening on explicit "startCompletion" keypress
    : context.matchBefore(/\\?\\[^\\]*(\[[^\]]*])?[^\\]*/);

  if (!matchBefore) {
    return null;
  }

  // ignore some matches when not opening on explicit "startCompletion" keypress
  if (!context.explicit) {
    // ignore matches that end with two backslashes. \\ shouldn't show the autocomplete as it's used for line break.
    if (/\\\\$/.test(matchBefore.text)) {
      return null;
    }

    // ignore matches that end with whitespace, unless after a comma
    // e.g. \item with a trailing space shouldn't show the autocomplete.
    if (/[^,\s]\s+$/.test(matchBefore.text)) {
      return null;
    }
  }

  const multipleArgumentMatcher =
    /^(?<before>\\(?<command>\w+)\*?(?<arguments>(\[[^\]]*?]|\{[^}]*?})+)?{)(?<existing>([^}]+\s*,\s*)+)?(?<prefix>[^}]+)?$/;
  // If this is a command with multiple comma-separated arguments, show deduplicated available completions
  const match = matchBefore.text.match(multipleArgumentMatcher);

  return { match, matchBefore };
}
