import { SSEMessage } from "rdjs-wheel";

export const COMPILE_END_MARKER = "====END====";
export const COMPILE_CLEAR_MARKER = "====CLEAR====";

export function sseLogMessagesToPlainText(messages: SSEMessage[]): string {
  return messages.map((message) => message.data).join("");
}
