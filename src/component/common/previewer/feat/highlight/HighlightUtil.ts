import { PageViewport, PDFPageProxy } from "pdfjs-dist";
import { CSSProperties } from "react";
import { TextItem } from "react-pdf";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";

/** Median line spacing inferred from SyncTeX y values on the same page. */
export const computeMedianLineStep = (positions: PdfPosition[]): number | undefined => {
  const ys = [...new Set(positions.map((p) => p.y))].sort((a, b) => a - b);
  if (ys.length < 2) return undefined;

  const steps: number[] = [];
  for (let i = 1; i < ys.length; i++) {
    const step = ys[i] - ys[i - 1];
    if (step > 0) steps.push(step);
  }
  if (steps.length === 0) return undefined;

  steps.sort((a, b) => a - b);
  const mid = Math.floor(steps.length / 2);
  return steps.length % 2 === 0 ? (steps[mid - 1] + steps[mid]) / 2 : steps[mid];
};

/**
 * SyncTeX box → viewport CSS rect.
 * API `x`/`y` map to synctex box_visible_h / box_visible_v; `y` is the lower
 * reference point (baseline area), not the box top — see TeXworks TWSynchronize.
 */
export const pdfPositionToViewportRect = (
  pos: PdfPosition,
  viewport: PageViewport,
  lineStep?: number
): { left: number; top: number; width: number; height: number } => {
  const syncTop = pos.y - pos.height;
  const depth =
    lineStep !== undefined && lineStep > pos.height ? lineStep - pos.height : 0;
  const boxHeight = pos.height + depth;

  const pdfYTop = viewport.viewBox[3] - syncTop;
  const pdfYBottom = viewport.viewBox[3] - syncTop - boxHeight;

  const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
    pos.x,
    pdfYBottom,
    pos.x + pos.width,
    pdfYTop,
  ]);

  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
};

export const extractTextItems = async (
  page: PDFPageProxy,
  setHighlightAreas: any,
  searchText: string,
  height?: number
) => {
  if (searchText) {
    const textContent = await page.getTextContent();
    const textItems = textContent.items.filter((item) => "str" in item);

    const matches = findTextItemRanges(textItems, searchText);

    if (matches.length > 0) {
      setHighlightAreas((prev:any) => [
        ...prev,
        {
          pageIndex: page.pageNumber,
          pageHeight: height,
          textItems: matches,
        },
      ]);
    }
  }
};

/**
 * Finds text that may span multiple PDF text items
 */
export const findTextItemRanges = (
  textItems: TextItem[],
  searchText: string
): Array<{
  item: TextItem;
  matchStartInItem: number;
  matchEndInItem: number;
}> => {
  const results: any = [];

  // Join all text with spaces
  const joinedText = textItems.map((item) => item.str).join("");

  // Find the match in joined text
  const matchIndex = joinedText.toLowerCase().indexOf(searchText.toLowerCase());
  if (matchIndex === -1) return results;

  const matchEnd = matchIndex + searchText.length;

  // Map back to individual text items
  let currentPosition = 0;

  textItems.forEach((item) => {
    const itemStart = currentPosition;
    const itemEnd = currentPosition + item.str.length;

    // Check if this item overlaps with the match
    const hasOverlap = !(itemEnd < matchIndex || itemStart >= matchEnd);

    if (hasOverlap) {
      results.push({
        item,
        matchStartInItem: Math.max(0, matchIndex - itemStart),
        matchEndInItem: Math.min(item.str.length, matchEnd - itemStart),
      });
    }

    currentPosition = itemEnd + 1; // +1 for the space
  });

  return results;
};

export const calculateHighlightStyle = (
  textItem: TextItem,
  matchStart: number,
  matchEnd: number,
  pageScale: number,
  pageHeight: number
): CSSProperties => {
  const [, , , scaleY, translateX, translateY] = textItem.transform;

  // 1. Get font size from transform matrix
  const fontSize = scaleY;

  // 2. Calculate character-level positioning
  const fullTextWidth = textItem.width;
  const avgCharWidth = fullTextWidth / textItem.str.length;

  // Width of text before the match
  const beforeMatchWidth = matchStart * avgCharWidth;
  // Width of the matched text
  const matchWidth = (matchEnd - matchStart) * avgCharWidth;

  // 3. Convert from PDF coordinates (bottom-left origin) to CSS (top-left origin)
  const pdfTop = pageHeight - translateY - fontSize;

  // 4. Apply scale and convert to pixels
  const scaledLeft = (translateX + beforeMatchWidth) * pageScale;
  const scaledWidth = matchWidth * pageScale;
  const scaledHeight = fontSize * pageScale;
  const scaledTop = pdfTop * pageScale - scaledHeight * 0.75; // Adjust for baseline

  return {
    position: "absolute",
    backgroundColor: "rgba(255, 235, 59, 0.5)",
    border: "1px solid rgba(255, 193, 7, 0.8)",
    left: `${scaledLeft}px`,
    top: `${scaledTop}px`,
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    pointerEvents: "none",
  };
};
