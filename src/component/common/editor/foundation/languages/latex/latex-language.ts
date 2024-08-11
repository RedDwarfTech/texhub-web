import { LRLanguage, foldNodeProp, foldInside } from "@codemirror/language";
import { parser } from "../../extensions/lezer-latex/latex.mjs";
import { closeBracketConfig } from "./close-bracket-config";
import { NodeProp } from "@lezer/common";
import { styleTags, tags as t } from "@lezer/highlight";
import * as termsModule from "../../extensions/lezer-latex/latex.terms.mjs";
import {
  Tokens,
  commentIsOpenFold,
  findClosingFoldComment,
  getFoldRange,
} from "../../utils/tree-query";

const styleOverrides: Record<string, any> = {
  DocumentClassCtrlSeq: t.keyword,
  UsePackageCtrlSeq: t.keyword,
  CiteCtrlSeq: t.keyword,
  CiteStarrableCtrlSeq: t.keyword,
  RefCtrlSeq: t.keyword,
  RefStarrableCtrlSeq: t.keyword,
  LabelCtrlSeq: t.keyword,
};

const styleEntry = (token: string, defaultStyle: any) => {
  return [token, styleOverrides[token] || defaultStyle];
};

const Styles = {
  ctrlSeq: Object.fromEntries(
    Tokens.ctrlSeq.map((token) => styleEntry(token, t.tagName))
  ),
  ctrlSym: Object.fromEntries(
    Tokens.ctrlSym.map((token) => styleEntry(token, t.literal))
  ),
  envName: Object.fromEntries(
    Tokens.envName.map((token) => styleEntry(token, t.attributeValue))
  ),
};

const typeMap: Record<string, string[]> = {
  // commands that are section headings
  PartCtrlSeq: ["$SectioningCommand"],
  ChapterCtrlSeq: ["$SectioningCommand"],
  SectionCtrlSeq: ["$SectioningCommand"],
  SubSectionCtrlSeq: ["$SectioningCommand"],
  SubSubSectionCtrlSeq: ["$SectioningCommand"],
  ParagraphCtrlSeq: ["$SectioningCommand"],
  SubParagraphCtrlSeq: ["$SectioningCommand"],
  // commands that have a "command tooltip"
  HrefCommand: ["$CommandTooltipCommand"],
  Include: ["$CommandTooltipCommand"],
  Input: ["$CommandTooltipCommand"],
  Ref: ["$CommandTooltipCommand"],
  UrlCommand: ["$CommandTooltipCommand"],
  // text formatting commands that can be toggled via the toolbar
  TextBoldCommand: ["$ToggleTextFormattingCommand"],
  TextItalicCommand: ["$ToggleTextFormattingCommand"],
  // text formatting commands that cannot be toggled via the toolbar
  TextSmallCapsCommand: ["$OtherTextFormattingCommand"],
  TextTeletypeCommand: ["$OtherTextFormattingCommand"],
  TextMediumCommand: ["$OtherTextFormattingCommand"],
  TextSansSerifCommand: ["$OtherTextFormattingCommand"],
  TextSuperscriptCommand: ["$OtherTextFormattingCommand"],
  TextSubscriptCommand: ["$OtherTextFormattingCommand"],
  StrikeOutCommand: ["$OtherTextFormattingCommand"],
  EmphasisCommand: ["$OtherTextFormattingCommand"],
  UnderlineCommand: ["$OtherTextFormattingCommand"],
};

/**
 * LR 解析器（Left-to-right, Rightmost derivation parser）是一类用于语法分析的工具，广泛应用于编译器设计中。
 * 它们以自底向上的方式解析输入，能够处理广泛的上下文无关文法（CFG）。
 * LR 解析器特别适合于处理复杂的语言语法，并且是许多编程语言的语法分析器的基础。
 * https://zh.wikipedia.org/wiki/LR%E5%89%96%E6%9E%90%E5%99%A8
 * https://en.wikipedia.org/wiki/LALR_parser
 * 1965年， Donald Knuth发明了LR语法解析器，(从左往右，最右推导).
 * 它可以在线性时间里识别任何确定性的上下文无关的语言。
 * 然而，最右推导需要大的内存消耗，由于当时计算机内存有限，实现一个LR解析器并不实用。
 * 为了解决这个缺点，在1969年，Frank DeRemer提出了两种简化版本的LR解析器，即Look-Ahead LR和Simple LR。
 * 这两个版本以降低语言识别能力为代价，有着更少的内存消耗。其中LALR是能力最强的一个选择。
 * 之后，在1977年，发明了对LR解析器的内存优化，但LR解析器依然没有简化的版本的内存效率高。
 * 在1979年，Frank DeRemer和Tom Pennello宣布了一些列的对LALR的优化，进一步提高了内存效率。
 * 这些优化方法的正式提出是在1982年。
 */
export const LaTeXLanguage = LRLanguage.define({
  name: "latex",
  parser: parser.configure({
    props: [
      foldNodeProp.add({
        Comment: (node, state) => {
          if (commentIsOpenFold(node, state)) {
            const closingFoldNode = findClosingFoldComment(node, state);
            if (closingFoldNode) {
              return getFoldRange(node, closingFoldNode, state);
            }
          }
          return null;
        },
        Group: foldInside,
        NonEmptyGroup: foldInside,
        TextArgument: foldInside,
        // TODO: Why isn't
        // `Content: node => node,`
        // enough? For some reason it doesn't work if there's a newline after
        // \section{a}, but works for \section{a}b
        $Environment: (node) => node.getChild("Content"),
        $SectioningCommand: (node) => {
          const BACKWARDS = -1;
          const lastChild = node.resolveInner(node.to, BACKWARDS);
          const content = node.getChild("Content");
          if (!content) {
            return null;
          }
          if (lastChild.type.is(termsModule.NewLine)) {
            // Ignore last newline for sectioning commands
            return { from: content!.from, to: lastChild.from };
          }
          if (lastChild.type.is(termsModule.Whitespace)) {
            // If the sectioningcommand is indented on a newline
            let sibling = lastChild.prevSibling;
            while (sibling?.type.is(termsModule.Whitespace)) {
              sibling = sibling.prevSibling;
            }
            if (sibling?.type.is(termsModule.NewLine)) {
              return { from: content!.from, to: sibling.from };
            }
          }
          if (lastChild.type.is(termsModule.BlankLine)) {
            // HACK: BlankLine can contain any number above 2 of \n's.
            // Include every one except for the last one
            return { from: content!.from, to: lastChild.to - 1 };
          }
          return content;
        },
      }),
      // TODO: does this override groups defined in the grammar?
      NodeProp.group.add((type) => {
        const types = [];

        if (
          Tokens.ctrlSeq.includes(type.name) ||
          Tokens.ctrlSym.includes(type.name)
        ) {
          types.push("$CtrlSeq");
          if (Tokens.ctrlSym.includes(type.name)) {
            types.push("$CtrlSym");
          }
        } else if (Tokens.envName.includes(type.name)) {
          types.push("$EnvName");
        } else if (type.name.endsWith("Command")) {
          types.push("$Command");
        } else if (type.name.endsWith("Argument")) {
          types.push("$Argument");
          if (
            type.name.endsWith("TextArgument") ||
            type.is("SectioningArgument")
          ) {
            types.push("$TextArgument");
          }
        } else if (
          type.name.endsWith("Environment") &&
          !["NewEnvironment", "RenewEnvironment"].includes(type.name)
        ) {
          types.push("$Environment");
        } else if (type.name.endsWith("Brace")) {
          types.push("$Brace");
        } else if (
          ["BracketMath", "ParenMath", "DollarMath"].includes(type.name)
        ) {
          types.push("$MathContainer");
        }

        if (type.name in typeMap) {
          types.push(...typeMap[type.name]);
        }

        return types.length > 0 ? types : undefined;
      }),
      styleTags({
        ...Styles.ctrlSeq,
        ...Styles.ctrlSym,
        ...Styles.envName,
        "HrefCommand/ShortTextArgument/ShortArg/...": t.link,
        "HrefCommand/UrlArgument/...": t.monospace,
        "CtrlSeq Csname": t.tagName,
        "DocumentClass/OptionalArgument/ShortOptionalArg/...": t.attributeValue,
        "DocumentClass/ShortTextArgument/ShortArg/Normal": t.typeName,
        "ListEnvironment/BeginEnv/OptionalArgument/...": t.monospace,
        Number: t.number,
        OpenBrace: t.brace,
        CloseBrace: t.brace,
        OpenBracket: t.squareBracket,
        CloseBracket: t.squareBracket,
        Dollar: t.string,
        Math: t.string,
        "Math/MathChar": t.string,
        "Math/MathSpecialChar": t.string,
        "Math/Number": t.string,
        "MathGroup/OpenBrace MathGroup/CloseBrace": t.string,
        "MathTextCommand/TextArgument/OpenBrace MathTextCommand/TextArgument/CloseBrace":
          t.string,
        "MathOpening/LeftCtrlSeq MathClosing/RightCtrlSeq MathUnknownCommand/CtrlSeq MathTextCommand/CtrlSeq":
          t.literal,
        MathDelimiter: t.literal,
        DoubleDollar: t.keyword,
        Tilde: t.keyword,
        Ampersand: t.keyword,
        LineBreakCtrlSym: t.keyword,
        Comment: t.comment,
        "UsePackage/OptionalArgument/ShortOptionalArg/Normal": t.attributeValue,
        "UsePackage/ShortTextArgument/ShortArg/Normal": t.tagName,
        "Affiliation/OptionalArgument/ShortOptionalArg/Normal":
          t.attributeValue,
        "Affil/OptionalArgument/ShortOptionalArg/Normal": t.attributeValue,
        "LiteralArgContent VerbContent VerbatimContent LstInlineContent":
          t.string,
        "NewCommand/LiteralArgContent": t.typeName,
        "LabelArgument/ShortTextArgument/ShortArg/...": t.attributeValue,
        "RefArgument/ShortTextArgument/ShortArg/...": t.attributeValue,
        "BibKeyArgument/ShortTextArgument/ShortArg/...": t.attributeValue,
        "ShortTextArgument/ShortArg/Normal": t.monospace,
        "UrlArgument/LiteralArgContent": [t.attributeValue, t.url],
        "FilePathArgument/LiteralArgContent": t.attributeValue,
        "BareFilePathArgument/SpaceDelimitedLiteralArgContent":
          t.attributeValue,
        TrailingContent: t.comment,
        "Item/OptionalArgument/ShortOptionalArg/...": t.strong,
        // TODO: t.strong, t.emphasis
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "%" },
    closeBrackets: closeBracketConfig,
  },
});
