import { Compartment, Extension, StateEffect, StateField } from "@codemirror/state";
import { indentUnit, LanguageDescription } from "@codemirror/language";
import { languages } from "../languages";
import { TeXCommand } from "@/model/types/metadata/metadata";
import { Folder } from "../../../../../types/folder";
import { ViewPlugin } from "@codemirror/view";

const languageCompartment = new Compartment();
const languageConf = new Compartment();
export const languageLoadedEffect = StateEffect.define();
export const setSyntaxValidationEffect = StateEffect.define<boolean>();

export const language = (
  docName: string,
  metadata: Metadata,
  syntaxValidation: boolean
) => {
  /**
   * Compartment 是 CodeMirror 6 中的一个重要概念，用于提供对编辑器的配置进行动态调整的能力。
   * 它允许在运行时为 CodeMirror 编辑器的某些功能和行为提供独立的配置，而不会影响编辑器的其他部分。
   * 主要作用
      动态配置：
      Compartment 允许你在不重置整个编辑器的情况下，为编辑器的特定部分应用不同的配置。
      例如，你可以在编辑器的不同区域应用不同的语言模式、主题或插件设置。

      局部配置管理：
      通过 Compartment，你可以在编辑器的不同部分使用不同的设置。这样可以更细粒度地控制编辑器的行为和外观。

      灵活性：
      Compartment 提供了灵活的配置管理，使得编辑器在复杂应用场景下的配置变得更加简单和高效。
   */
  return languageCompartment.of(
    buildExtension(docName, metadata, syntaxValidation)
  );
};

const buildExtension = (
  docName: string,
  metadata: Metadata,
  syntaxValidation: boolean
): Extension[] => {
  /**
   * 在 CodeMirror 6 中，LanguageDescription 是一个重要的概念，用于定义和管理语言的语法规则和解析行为。
   * 它主要用于配置编辑器如何理解和处理不同编程语言的语法。
   * matchFilename根据文件扩展名进行匹配
   */
  const languageDescription = LanguageDescription.matchFilename(
    languages,
    docName
  );
  if (!languageDescription) {
    return [];
  }
  return [
    /**
     * Default to four-space indentation and set the configuration in advance,
     * to prevent a shift in line indentation markers when the LaTeX language loads.
     */
    languageConf.of(indentUnit.of("    ")),
    metadataState,
    /**
     * A view plugin which loads the appropriate language for the current file extension,
     * then dispatches an effect so other extensions can update accordingly.
     */
    ViewPlugin.define((view) => {
      // load the language asynchronously
      languageDescription.load().then((support) => {
        view.dispatch({
          effects: [
            languageConf.reconfigure(support),
            languageLoadedEffect.of(null),
          ],
        });
        // Wait until the previous effects have been processed
        view.dispatch({
          effects: [
            setMetadataEffect.of(metadata),
            setSyntaxValidationEffect.of(syntaxValidation),
          ],
        });
      });

      return {};
    }),
    metadataState,
  ];
};

export type Metadata = {
  labels: Set<string>;
  packageNames: Set<string>;
  commands: TeXCommand[];
  referenceKeys: Set<string>;
  fileTreeData: Folder;
};

/**
 * A state field that stores the metadata parsed from a project on the server.
 */
export const metadataState = StateField.define<Metadata | undefined>({
  create: () => undefined,
  update: (value, transaction) => {
    for (const effect of transaction.effects) {
      if (effect.is(setMetadataEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

export const setMetadataEffect = StateEffect.define<Metadata>();
