import { Keybindings, PdfViewer } from './project-settings'
import {
  FontFamily,
  LineHeight,
  OverallTheme,
} from '../../component/common/editor/foundation/extensions/theme'

export type UserSettings = {
  pdfViewer: PdfViewer
  autoComplete: boolean
  autoPairDelimiters: boolean
  syntaxValidation: boolean
  editorTheme: string
  overallTheme: OverallTheme
  mode: Keybindings
  fontSize: number
  fontFamily: FontFamily
  lineHeight: LineHeight
  mathPreview: boolean
}
