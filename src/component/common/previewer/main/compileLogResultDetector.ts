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
    .map((line) =>
      isErrorLogLine(line)
        ? `<p style='color:red;'>${escapeHtml(line)}</p>`
        : escapeHtml(line),
    )
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
