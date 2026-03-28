import { isDevModel } from "@/common/EnvUtil";
import localLog, { LogRecord } from "@/common/storage/log/LocalLog";

export type LogLevel = "info" | "warn" | "error" | "debug" | "log";

/**
 * Simple logger wrapper around localLog that also forwards to console.
 * Usage:
 *   import logger from '@/common/storage/log/Logger';
 *   logger.info('User opened file', { fileId });
 */
const safeAdd = async (record: LogRecord) => {
  try {
    await localLog.add(record);
  } catch (e) {
    // swallow logging errors to avoid affecting app flow
    // optionally: send to remote logging service in the future
    console.error("Failed to write log to IndexedDB", e);
  }
};

const enableDebug = (): boolean => {
  return isDevModel();
}

const enableInfo = (): boolean => {
  return isDevModel();
}

const enableError = (): boolean => {
  return isDevModel();
}

const enableWarn = (): boolean => {
  return isDevModel();
}

const Logger = {
  async add(level: LogLevel, message: string, meta?: any) {
    // write to indexeddb (non-blocking if caller doesn't await)
    const record: LogRecord = {
      level,
      fun: "logger",
      url: "app.logger",
      params: { message, meta },
      date: new Date(),
    };
    return safeAdd(record);
  },

  info(message: string, meta?: any) {
    if(enableInfo()){
      return;
    }
    // show in console and write to db
    console.info(message, meta);
    return this.add("info", message, meta);
  },

  warn(message: string, meta?: any) {
    if(!enableWarn()){
      return;
    }
    console.warn(message, meta);
    return this.add("warn", message, meta);
  },

  error(message: string, meta?: any) {
    if(!enableError()){
      return;
    }
    console.error(message, meta);
    return this.add("error", message, meta);
  },

  debug(message: string, meta?: any) {
    if(!enableDebug()){
      return;
    }
    console.debug(message, meta);
    return this.add("debug", message, meta);
  },

  log(message: string, meta?: any) {
    console.log(message, meta);
    return this.add("log", message, meta);
  },
};

export default Logger;
