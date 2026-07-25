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
        return pageRef + 1;
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

export function findActiveOutlineKey(
  entries: OutlineIndexEntry[],
  curPage: number
): OutlineIndexEntry | undefined {
  if (!entries.length || curPage == null || curPage < 0) {
    return undefined;
  }
  let best: OutlineIndexEntry | undefined;
  for (const entry of entries) {
    if (entry.page <= curPage) {
      if (!best || entry.page > best.page) {
        best = entry;
      }
    }
  }
  return best;
}
