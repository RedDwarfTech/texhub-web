import { applySnippet, extendOverUnpairedClosingBrace } from './apply'
import { Completion, CompletionContext } from '@codemirror/autocomplete';
import { documentCommands } from '../document-commands';
import { Command } from '../../../utils/tree-operations/commands'
import { syntaxTree } from '@codemirror/language'
import { ProjectionResult } from '../../../utils/tree-operations/projection';
import { StateField } from '@codemirror/state';

const commandNameFromLabel = (label: string): string | undefined =>
  label.match(/^\\\w+/)?.[0]

export function customCommandCompletions(
  context: CompletionContext,
  commandCompletions: Completion[]
) {
  const existingCommands = new Set(
    commandCompletions
      .map(item => commandNameFromLabel(item.label))
      .filter(Boolean)
  )

  const output: Completion[] = []

  const items = countCommandUsage(context)

  for (const item of items.values()) {
    if (!existingCommands.has(commandNameFromLabel(item.label))) {
      output.push({
        type: 'cmd',
        label: item.label,
        boost: Math.max(0, item.count - 10),
        apply: applySnippet(item.snippet),
        extend: extendOverUnpairedClosingBrace,
      })
    }
  }
  return commandCompletions.concat(output)
}

const countCommandUsage = (context: CompletionContext) => {
  const tree = syntaxTree(context.state)
  const currentNode = tree.resolveInner(context.pos, -1)

  const result = new Map<
    string,
    { label: string; snippet: string; count: number }
  >()
  /**
   * CodeMirror 6 采用了一种基于状态的设计，每个编辑器实例都有一个状态对象，
   * 这个状态对象可以包含各种信息，比如光标位置、文档内容、编辑器的各种配置等。
   * 状态对象的结构可以通过不同的“字段”来扩展和修改。
   * context.state.field 用于访问和操作当前编辑器状态中某个特定字段的值。
   * 字段（field）是编辑器状态中的数据部分，通常用于存储与文档或编辑器操作相关的信息。
   * 例如，可以存储语法高亮的信息、注释数据、搜索结果等。
   * 具体来说，context.state.field 是在 CodeMirror 6 插件系统中的一个 API，允许插件访问和修改编辑器状态中的字段。
   * 这通常用于创建自定义功能和扩展。例如，如果你正在开发一个插件并希望在编辑器状态中跟踪特定信息，
   * 你可以定义一个字段来保存这些信息，然后通过 context.state.field 来访问或修改它。
   * 
   * 这里暂时调整Require为false，否则会出现Field is not present in this state错误
   * 具体为什么会出现错误还没弄明白
   */
  const commandListProjection = context.state.field(documentCommands, false)
  if(!commandListProjection){
    return result;
  }

  if (!commandListProjection.items) {
    return result
  }

  for (const command of commandListProjection.items) {
    if (command.from === currentNode.from) {
      continue
    }
    const label = buildLabel(command)
    const snippet = buildSnippet(command)

    const item = result.get(label) || { label, snippet, count: 0 }
    item.count++
    result.set(label, item)
  }

  return result
}

const buildLabel = (command: Command): string => {
  return [
    `${command.title}`,
    '[]'.repeat(command.optionalArgCount),
    '{}'.repeat(command.requiredArgCount),
  ].join('')
}

const buildSnippet = (command: Command): string => {
  return [
    `${command.title}`,
    '[#{}]'.repeat(command.optionalArgCount),
    '{#{}}'.repeat(command.requiredArgCount),
  ].join('')
}
