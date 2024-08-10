import * as termsModule from '@/component/common/editor/foundation/extensions/lezer-latex/latex.terms.mjs'

export const tokenNames: Array<string> = Object.keys(termsModule)

export const Tokens: Record<string, Array<string>> = {
  ctrlSeq: tokenNames.filter(name => name.match(/^(Begin|End|.*CtrlSeq)$/)),
  ctrlSym: tokenNames.filter(name => name.match(/^.*CtrlSym$/)),
  envName: tokenNames.filter(name => name.match(/^.*EnvName$/)),
}
