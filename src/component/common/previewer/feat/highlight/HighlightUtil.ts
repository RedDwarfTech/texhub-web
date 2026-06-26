import { PageViewport, PDFPageProxy } from "pdfjs-dist";
import { CSSProperties } from "react";
import { TextItem } from "react-pdf";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";

/** SyncTeX (top-left origin) → viewport CSS rect for PDF highlight overlays. */
export const pdfPositionToViewportRect = (
  pos: PdfPosition,
  viewport: PageViewport
): { left: number; top: number; width: number; height: number } => {
  const pageHeight = viewport.viewBox[3] - viewport.viewBox[1];
  const pdfX1 = pos.x;
  const pdfX2 = pos.x + pos.width;
  const pdfYBottom = pageHeight - pos.y - pos.height;
  const pdfYTop = pageHeight - pos.y;

  const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
    pdfX1,
    pdfYBottom,
    pdfX2,
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
