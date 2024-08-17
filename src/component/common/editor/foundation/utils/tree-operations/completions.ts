import { CompletionContext, CompletionSource } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { SyntaxNode } from "@lezer/common";
import { ancestorOfNodeWithType } from "./ancestors";
import { BaseMethods } from "rdjs-wheel";

export const ifInType = (
  type: string,
  source: CompletionSource
): CompletionSource => {
  let completionSource: CompletionSource = (context: CompletionContext) => {
    /**
     * 代码自动完成触发了2次，只让第二次生效
     * 暂时还未找到是什么原因导致
     */
    let autoCompleteCache = localStorage.getItem("autocomplete");
    if (BaseMethods.isNull(autoCompleteCache)) {
      let triggerInfo = {
        count: 1,
        triggerTime: new Date().getTime(),
      };
      localStorage.setItem("autocomplete", JSON.stringify(triggerInfo));
      return null;
    } else {
      let auto = JSON.parse(autoCompleteCache!.toString());
      let durationTime = new Date().getTime() - Number(auto.triggerTime);
      if(auto.count === 1 &&  durationTime < 10){

      }else{
        let triggerInfo = {
          count: 1,
          triggerTime: new Date().getTime(),
        };
        localStorage.setItem("autocomplete", JSON.stringify(triggerInfo));
        return null;
      }
    }
    const tree = syntaxTree(context.state);
    let node: SyntaxNode | null = tree.resolveInner(context.pos, -1);
    while (node) {
      if (node.type.is(type)) {
        return source(context);
      }
      node = node.parent;
    }
    return null;
  };
  return completionSource;
};

function isInEmptyArgumentNodeOfType(state: EditorState, types: string[]) {
  const main = state.selection.main;
  if (!main.empty) {
    return false;
  }

  const pos = main.anchor;
  const tree = syntaxTree(state);

  if (tree.length < pos) {
    return false;
  }

  const nodeLeft = tree.resolveInner(pos, -1);
  if (!nodeLeft.type.is("OpenBrace")) {
    return false;
  }

  const nodeRight = tree.resolveInner(pos, 1);
  if (!nodeRight.type.is("CloseBrace")) {
    return false;
  }

  const ancestor = ancestorOfNodeWithType(nodeLeft, ...types);
  if (!ancestor) {
    return false;
  }

  return ancestor.from === nodeLeft.from && ancestor.to === nodeRight.to;
}

export function isInEmptyArgumentNodeForAutocomplete(state: EditorState) {
  return isInEmptyArgumentNodeOfType(state, [
    "EnvNameGroup",
    "BibliographyStyleArgument",
    "BibliographyArgument",
    "BibKeyArgument",
    "DocumentClassArgument",
    "FilePathArgument",
    "RefArgument",
    "PackageArgument",
  ]);
}

export function isInEmptyCiteArgumentNode(state: EditorState) {
  return isInEmptyArgumentNodeOfType(state, ["BibKeyArgument"]);
}
