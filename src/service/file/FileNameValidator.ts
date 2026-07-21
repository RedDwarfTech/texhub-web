const MAX_FILE_NAME_LENGTH = 255;
const ALLOWED_CHAR_RE = /^[A-Za-z0-9\u4e00-\u9fff_.-]$/u;

export type FileNameValidateResult =
  | { ok: true; name: string }
  | { ok: false; messageKey: string };

/**
 * 严格文件名校验：字母/数字/中文/下划线/连字符/点；禁止空格与其它符号。
 */
export function validateFileName(
  raw: string,
  emptyMessageKey = "tips_input_file_new_name"
): FileNameValidateResult {
  const name = (raw ?? "").trim();
  if (!name) {
    return { ok: false, messageKey: emptyMessageKey };
  }
  if (name === "." || name === "..") {
    return { ok: false, messageKey: "tips_file_name_reserved" };
  }
  if (name.length > MAX_FILE_NAME_LENGTH) {
    return { ok: false, messageKey: "tips_file_name_length_exceed" };
  }
  for (const ch of name) {
    if (!ALLOWED_CHAR_RE.test(ch)) {
      return { ok: false, messageKey: "tips_file_name_invalid_chars" };
    }
  }
  return { ok: true, name };
}
