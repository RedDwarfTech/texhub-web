import React, { ComponentType } from "react";

const STORAGE_KEY = "texhub:lazy-chunk-reload";
const MAX_AUTO_RELOADS = 1;
const MIN_INTERVAL_MS = 10_000;
const NEW_INCIDENT_MS = 10 * 60 * 1000;

type ReloadState = {
  count: number;
  at: number;
};

export function isChunkLoadError(error: unknown): boolean {
  const text = chunkErrorText(error);
  return (
    /Failed to fetch dynamically imported module/i.test(text) ||
    /error loading dynamically imported module/i.test(text) ||
    /Importing a module script failed/i.test(text) ||
    /Failed to load module script/i.test(text) ||
    /Loading chunk .* failed/i.test(text)
  );
}

function chunkErrorText(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error ?? "");
}

function readState(): ReloadState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { count: 0, at: 0 };
    }
    const parsed = JSON.parse(raw) as ReloadState;
    if (typeof parsed?.count !== "number" || typeof parsed?.at !== "number") {
      return { count: 0, at: 0 };
    }
    return parsed;
  } catch {
    return { count: 0, at: 0 };
  }
}

function writeState(state: ReloadState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearChunkReloadState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * 动态分包加载失败时自动刷新一次。
 * - 成功加载后清标记，之后 Edge 休眠仍可再兜底一次
 * - 10s 内或已用完本次额度则停止，避免 reload 死循环
 * - 10 分钟后视为新事件，允许再次自动刷新
 */
export function reloadOnChunkLoadError(error: unknown): boolean {
  if (!isChunkLoadError(error) || typeof window === "undefined") {
    return false;
  }

  const now = Date.now();
  let state = readState();
  if (state.at > 0 && now - state.at > NEW_INCIDENT_MS) {
    state = { count: 0, at: 0 };
  }
  if (state.at > 0 && now - state.at < MIN_INTERVAL_MS) {
    return false;
  }
  if (state.count >= MAX_AUTO_RELOADS) {
    return false;
  }

  writeState({ count: state.count + 1, at: now });
  window.location.reload();
  return true;
}

export function lazyWithReload<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    try {
      const mod = await importer();
      clearChunkReloadState();
      return mod;
    } catch (error) {
      if (reloadOnChunkLoadError(error)) {
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}
