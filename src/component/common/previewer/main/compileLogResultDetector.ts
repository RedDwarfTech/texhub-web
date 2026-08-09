import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import {
  COMPILE_CLEAR_MARKER,
  COMPILE_END_MARKER,
} from "@/model/proj/compile/CompileLogMarkers";

export { COMPILE_CLEAR_MARKER, COMPILE_END_MARKER };

/** LaTeX 以 `!` 开头的致命错误行 */
const LATEX_ERROR_LINE = /^\s*!/;

/**
 * 出现在整段日志中的错误特征（不一定以 `!` 开头）
 */
const FULL_LOG_ERROR_PATTERNS: RegExp[] = [
  /Emergency stop\./,
  /Fatal error occurred/,
  /No pages of output\./,
  /pdfTeX error/i,
  /XeTeX error/i,
  /LuaTeX error/i,
  /Runaway argument/,
  /! LaTeX Error:/,
  /! Undefined control sequence/,
  /! Missing \$ inserted/,
  /! File `[^']+' not found/,
  /! I can't find file/,
  /! Missing \\begin{document}/,
  /! Too many \}'s/,
  /! Extra \}/,
  /! Misplaced alignment tab character/,
  /error:\s*(?:pdflatex|xelatex|lualatex|latexmk)/i,
  /(?:pdflatex|xelatex|lualatex|latexmk).*exited with (?:code )?[1-9]\d*/i,
  /Command .* failed with exit code [1-9]/i,
];

/** 编译成功时 TeX 引擎输出的典型标志 */
const SUCCESS_PATTERNS: RegExp[] = [
  /Output written on .*\.pdf\b/i,
];

export type CompileLogEntryType = "error" | "warning" | "badbox";

export interface CompileLogEntry {
  type: CompileLogEntryType;
  text: string;
  file?: string;
  line?: number;
}

/** 单行打开文件，如 `(/usr/.../article.cls` 或 `(./main.tex` */
const FILE_OPEN_RE = /^\((?<path>.+)$/;

/** 同一行打开并关闭文件，如 `(a.tex)` */
const FILE_OPEN_CLOSE_RE = /^\((?<path>.+)\)$/;

const FILE_CLOSE_RE = /^\s*\)\s*$/;

const LINE_NO_RE = /^l\.(?<num>\d+)/;

const BADBOX_RE = /^(Overfull|Underfull) \\[hv]box/;

const WARNING_RE =
  /^(LaTeX Warning:|Package [\w.-]+ Warning:|Class [\w.-]+ Warning:|.* Warning:)/;

const INPUT_LINE_RE = /on input line (\d+)/;

const KNOWN_TEX_EXT_RE =
  /\.(tex|sty|cls|clo|def|cfg|ltx|bib|bbl|aux|toc|fd)$/i;

/** 是否为可信的日志文件路径行（路径分隔符 / 以 ./ 开头 / 已知 TeX 扩展名） */
function isLikelyFilePath(path: string): boolean {
  const trimmed = path.trim();
  if (!trimmed) {
    return false;
  }
  return /[\\/]/.test(trimmed) || /^\.\//.test(trimmed) || KNOWN_TEX_EXT_RE.test(trimmed);
}

/**
 * 规整日志中的文件路径：
 * - 折叠 `a/./b`、`a/././b` 为 `a/b`
 * - 折叠开头的 `././` 为 `./`
 * - 压缩重复分隔符 `//`
 *
 * 例如 `./theory/./transformer/./intro/how-llm-works.tex` → `./theory/transformer/intro/how-llm-works.tex`
 */
export function normalizeTexPath(path: string): string {
  return path
    .replace(/\/{2,}/g, "/")
    .replace(/\/(?:\.\/)+/g, "/")
    .replace(/\.\/(?:\.\/)+/g, "./");
}

function isMarkerLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed === "" ||
    /^!/.test(trimmed) ||
    FILE_CLOSE_RE.test(line) ||
    FILE_OPEN_RE.test(line) ||
    FILE_OPEN_CLOSE_RE.test(line) ||
    WARNING_RE.test(trimmed) ||
    BADBOX_RE.test(trimmed)
  );
}

/**
 * 解析 LaTeX 编译日志为结构化条目（错误 / 警告 / 坏盒），并尽可能标注 file:line。
 *
 * 依赖 TeX 日志的常见格式约定：
 * - 错误以 `! ...` 开头，随后紧跟 `l.<n>` 行号与上下文行；
 * - 警告以 `LaTeX Warning:` / `Package ... Warning:` 开头；
 * - 坏盒以 `Overfull \hbox` / `Underfull \vbox` 开头；
 * - 文件出入栈以 `(path` 与 `)` 标记。
 */
export function parseCompileLog(plainLog: string): CompileLogEntry[] {
  const plain = stripCompileLogMarkup(plainLog ?? "");
  if (!plain.trim()) {
    return [];
  }

  const lines = plain.split("\n");
  const entries: CompileLogEntry[] = [];
  const fileStack: string[] = [];
  let currentFile = "";

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const openClose = FILE_OPEN_CLOSE_RE.exec(line);
    if (openClose && isLikelyFilePath(openClose.groups!.path)) {
      currentFile = normalizeTexPath(openClose.groups!.path.trim());
      i++;
      continue;
    }

    if (FILE_CLOSE_RE.test(line)) {
      fileStack.pop();
      currentFile = fileStack[fileStack.length - 1] ?? "";
      i++;
      continue;
    }

    const open = FILE_OPEN_RE.exec(line);
    if (open && isLikelyFilePath(open.groups!.path)) {
      const path = normalizeTexPath(open.groups!.path.trim());
      fileStack.push(path);
      currentFile = path;
      i++;
      continue;
    }

    if (BADBOX_RE.test(line)) {
      const block: string[] = [line];
      i++;
      while (i < lines.length && !isMarkerLine(lines[i])) {
        block.push(lines[i]);
        i++;
      }
      entries.push({
        type: "badbox",
        text: block.join("\n"),
        file: currentFile || undefined,
        line: undefined,
      });
      continue;
    }

    if (WARNING_RE.test(line.trim())) {
      const block: string[] = [line];
      i++;
      while (
        i < lines.length &&
        /^\s/.test(lines[i]) &&
        lines[i].trim() !== ""
      ) {
        block.push(lines[i]);
        i++;
      }
      const text = block.join("\n");
      const inputLine = INPUT_LINE_RE.exec(text);
      entries.push({
        type: "warning",
        text,
        file: currentFile || undefined,
        line: inputLine ? Number(inputLine[1]) : undefined,
      });
      continue;
    }

    if (/^!/.test(line)) {
      const block: string[] = [line];
      i++;
      let lineNo: number | undefined;
      while (i < lines.length) {
        const current = lines[i];
        if (isMarkerLine(current)) {
          break;
        }
        if (lineNo === undefined) {
          const lineMatch = LINE_NO_RE.exec(current);
          if (lineMatch) {
            lineNo = Number(lineMatch.groups!.num);
          }
        }
        block.push(current);
        i++;
      }
      entries.push({
        type: "error",
        text: block.join("\n"),
        file: currentFile || undefined,
        line: lineNo,
      });
      continue;
    }

    i++;
  }

  return entries;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function stripCompileLogMarkup(log: string): string {
  return log
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
}

export function isErrorLogLine(line: string): boolean {
  return LATEX_ERROR_LINE.test(line);
}

export function hasCompileLogErrors(log: string): boolean {
  const plain = stripCompileLogMarkup(log);
  if (!plain.trim()) {
    return false;
  }
  const lines = plain.split("\n");
  if (lines.some(isErrorLogLine)) {
    return true;
  }
  return FULL_LOG_ERROR_PATTERNS.some((pattern) => pattern.test(plain));
}

export function hasCompileLogSuccess(log: string): boolean {
  const plain = stripCompileLogMarkup(log);
  return SUCCESS_PATTERNS.some((pattern) => pattern.test(plain));
}

export function hasCompileEnded(log: string): boolean {
  return stripCompileLogMarkup(log).includes(COMPILE_END_MARKER);
}

/**
 * 根据编译日志推断成功/失败。
 *
 * 优先级：错误 > 成功标志（Output written on *.pdf）> 后端结束标记（无错误时视为成功）> 不变
 */
export function detectCompileResultFromLog(
  log: string,
  previousResult: CompileResultType,
): CompileResultType | null {
  if (!log || log.includes(COMPILE_CLEAR_MARKER)) {
    return null;
  }

  const plain = stripCompileLogMarkup(log);
  if (!plain.trim()) {
    return null;
  }

  if (hasCompileLogErrors(plain)) {
    return previousResult !== CompileResultType.FAILED
      ? CompileResultType.FAILED
      : null;
  }

  if (hasCompileLogSuccess(plain)) {
    return previousResult !== CompileResultType.SUCCESS
      ? CompileResultType.SUCCESS
      : null;
  }

  if (hasCompileEnded(plain)) {
    return previousResult !== CompileResultType.SUCCESS
      ? CompileResultType.SUCCESS
      : null;
  }

  return null;
}

/** 后端 queue.comp_result 为权威结果，应在编译结束时优先采用 */
export function compileResultFromBackend(
  compResult: number | undefined | null,
): CompileResultType | null {
  if (compResult === undefined || compResult === null) {
    return null;
  }
  if (
    compResult === CompileResultType.SUCCESS ||
    compResult === CompileResultType.FAILED ||
    compResult === CompileResultType.PROCESSING
  ) {
    return compResult;
  }
  return null;
}

export function formatCompileLogHtml(plainLog: string): string {
  if (!plainLog) {
    return "";
  }
  return plainLog
    .split("\n")
    .map((line) => {
      const displayLine =
        FILE_OPEN_RE.test(line) || FILE_OPEN_CLOSE_RE.test(line)
          ? normalizeTexPath(line)
          : line;
      return isErrorLogLine(displayLine)
        ? `<p style='color:red;'>${escapeHtml(displayLine)}</p>`
        : escapeHtml(displayLine);
    })
    .join("<br/>");
}

/**
 * 将 SSE 增量 chunk 追加到累积日志，并返回更新后的检测结果与展示 HTML。
 */
export function appendCompileLogChunk(
  accumulatedPlainLog: string,
  chunk: string,
  previousResult: CompileResultType,
): {
  plainLog: string;
  htmlLog: string;
  resultType: CompileResultType | null;
} {
  const plainLog = accumulatedPlainLog + chunk;
  const resultType = detectCompileResultFromLog(plainLog, previousResult);
  return {
    plainLog,
    htmlLog: formatCompileLogHtml(plainLog),
    resultType,
  };
}
