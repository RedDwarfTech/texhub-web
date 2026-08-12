import { DocumentCallback } from "react-pdf/dist/shared/types.js";

export interface OutlineItemRaw {
  title: string;
  dest?: unknown;
  items?: OutlineItemRaw[];
}

export interface OutlineIndexEntry {
  key: string;
  page: number;
  ancestorKeys: string[];
}

export interface OutlineDestPosition {
  page: number;
  h: number;
  v: number;
}

export function getOutlineNodeKey(
  parentKey: string,
  title: string,
  level: number
): string {
  return parentKey + title + level;
}

export async function resolveOutlinePageNumber(
  pdf: DocumentCallback,
  destination: unknown
): Promise<number | null> {
  try {
    if (!destination) {
      return null;
    }

    let resolvedDest: any = destination;
    if (typeof destination === "string") {
      resolvedDest = await pdf.getDestination(destination);
    }

    if (Array.isArray(resolvedDest) && resolvedDest.length > 0) {
      const pageRef = resolvedDest[0];
      if (typeof pageRef === "number") {
        // pdf.js 中 outline dest 数组第一个元素若是数字，是 PDF 规范定义的
        // 1-based 页码（例如 2 表示第 2 页），直接返回即可，不能 +1。
        return pageRef;
      }
      if (pageRef && typeof pageRef === "object") {
        const pageIndex = await pdf.getPageIndex(pageRef);
        return pageIndex + 1;
      }
    }

    if (resolvedDest && typeof resolvedDest === "object") {
      if ("num" in resolvedDest && typeof resolvedDest.num === "number") {
        return resolvedDest.num + 1;
      }
      const pageIndex = await pdf.getPageIndex(resolvedDest);
      return pageIndex + 1;
    }
  } catch (error) {
    console.error("Failed to resolve outline destination:", error, destination);
  }
  return null;
}

const toNumberOr = (value: unknown, fallback: number): number => {
  return typeof value === "number" && isFinite(value) ? value : fallback;
};

/**
 * Resolve a pdf.js outline destination into a SyncTeX source query position.
 *
 * Returns {page, h, v} in the same coordinate system the backend expects for
 * synctex_edit_query (top-left origin, y down, PDF points at scale 1), matching
 * the convention used by HighlightUtil.pdfPositionToViewportRect.
 */
export async function resolveOutlineDestPosition(
  pdf: DocumentCallback,
  destination: unknown
): Promise<OutlineDestPosition | null> {
  if (!destination) {
    return null;
  }

  let resolvedDest: any = destination;
  if (typeof destination === "string") {
    try {
      resolvedDest = await pdf.getDestination(destination);
    } catch (error) {
      console.error(
        "Failed to resolve named outline destination:",
        error,
        destination
      );
      return null;
    }
  }

  if (!Array.isArray(resolvedDest) || resolvedDest.length < 2) {
    return null;
  }

  const pageRef = resolvedDest[0];
  let pageNum: number | null = null;
  if (typeof pageRef === "number") {
    // pdf.js 中数字 pageRef 是 1-based 页码，直接使用，不能 +1。
    pageNum = pageRef;
  } else if (pageRef && typeof pageRef === "object") {
    try {
      const pageIndex = await pdf.getPageIndex(pageRef);
      pageNum = pageIndex + 1;
    } catch (error) {
      console.error("Failed to resolve outline page ref:", error, pageRef);
      return null;
    }
  }
  if (!pageNum || pageNum < 1) {
    return null;
  }

  let destX = 0;
  let destY: number | undefined;
  const mode = resolvedDest[1];
  switch (mode) {
    case "XYZ":
      destX = toNumberOr(resolvedDest[2], 0);
      destY = toNumberOr(resolvedDest[3], 0);
      break;
    case "FitH":
    case "FitBH":
      destY = toNumberOr(resolvedDest[2], 0);
      break;
    case "FitV":
    case "FitBV":
      destX = toNumberOr(resolvedDest[2], 0);
      break;
    case "FitR":
      destX = toNumberOr(resolvedDest[2], 0);
      destY = toNumberOr(resolvedDest[3], 0);
      break;
    default:
      break;
  }

  try {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const pageHeight = viewport.viewBox[3];
    // pdf.js dest coordinates are PDF user space (y up); SyncTeX v is measured
    // from the top of the page, so flip the vertical axis.
    const v = destY === undefined ? 0 : pageHeight - destY;
    return { page: pageNum, h: destX, v };
  } catch (error) {
    console.error(
      "Failed to get page viewport for outline destination:",
      error,
      destination
    );
    return null;
  }
}

async function walkOutlineItem(
  pdf: DocumentCallback,
  item: OutlineItemRaw,
  level: number,
  parentKey: string,
  ancestorKeys: string[],
  out: OutlineIndexEntry[]
): Promise<void> {
  const key = getOutlineNodeKey(parentKey, item.title, level);

  if (item.dest != null) {
    const page = await resolveOutlinePageNumber(pdf, item.dest);
    if (page != null && page > 0) {
      out.push({ key, page, ancestorKeys: [...ancestorKeys] });
    }
  }

  if (item.items && item.items.length > 0) {
    const childAncestors = [...ancestorKeys, key];
    for (let index = 0; index < item.items.length; index++) {
      await walkOutlineItem(
        pdf,
        item.items[index]!,
        level + 1,
        key + index,
        childAncestors,
        out
      );
    }
  }
}

export async function buildOutlineIndex(
  pdf: DocumentCallback,
  outline: OutlineItemRaw[]
): Promise<OutlineIndexEntry[]> {
  const entries: OutlineIndexEntry[] = [];
  if (!outline || outline.length === 0) {
    return entries;
  }
  for (let index = 0; index < outline.length; index++) {
    await walkOutlineItem(
      pdf,
      outline[index]!,
      0,
      "root" + index,
      [],
      entries
    );
  }
  return entries;
}

function outlineEntryDepth(entry: OutlineIndexEntry): number {
  return entry.ancestorKeys.length;
}

function isBetterOutlineMatch(
  candidate: OutlineIndexEntry,
  current: OutlineIndexEntry
): boolean {
  if (candidate.page !== current.page) {
    return candidate.page > current.page;
  }
  return outlineEntryDepth(candidate) > outlineEntryDepth(current);
}

export function findActiveOutlineKey(
  entries: OutlineIndexEntry[],
  curPage: number
): OutlineIndexEntry | undefined {
  if (!entries.length || curPage == null || curPage < 1) {
    return undefined;
  }
  let best: OutlineIndexEntry | undefined;
  for (const entry of entries) {
    if (entry.page <= curPage) {
      if (!best || isBetterOutlineMatch(entry, best)) {
        best = entry;
      }
    }
  }
  return best;
}
