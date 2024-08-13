import { CompletionContext, CompletionSource } from "rdcodemirror-autocomplete";
import { ifInType } from "../../utils/tree-query";
import { Completions } from "./completions/types";
import { buildAllCompletions } from "./completions";
import { customCommandCompletions } from './completions/doc-commands'
import {
  customEnvironmentCompletions,
  findEnvironmentsInDoc,
} from './completions/doc-environments'

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
  '$CtrlSeq',
  context => {
    return context.explicit ? null : commandCompletionSource(context)
  }
)

const commandCompletionSource = (context: CompletionContext) => {
  const completionMatches = getCompletionMatches(context)

  if (!completionMatches) {
    return null
  }

  const { match, matchBefore } = completionMatches
  if (match) {
    // We're already in a command argument, bail out
    return null
  }

  const completions: Completions = blankCompletions()

  buildAllCompletions(completions, context)

  // Unknown commands
  const prefixMatcher = /^\\[^{\s]*$/
  const prefixMatch = matchBefore.text.match(prefixMatcher)
  if (prefixMatch) {
    return {
      from: matchBefore.from,
      validFor: prefixMatcher,
      options: [
        ...completions.commands,
        ...customCommandCompletions(context, completions.commands),
        ...customEnvironmentCompletions(context),
      ],
    }
  }

  // anything else (no validFor)
  return {
    from: matchBefore.to,
    options: [
      ...completions.commands,
      ...customCommandCompletions(context, completions.commands),
    ],
  }
}

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
