import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { TextItem } from 'react-pdf';
import { calculateHighlightStyle } from './HighlightUtil';

export type HighlightArea = {
  pageIndex: number;
  pageHeight: number;  // Original PDF height in points
  textItems: Array<{
    item: TextItem;
    matchStartInItem: number;
    matchEndInItem: number;
  }>;
};

export type CustomHighlightLayerProps = {
  highlightAreas: HighlightArea[];
  totalPages: number;
  scale: number;  // Current page scale (e.g., 1.0, 1.5)
};

export const CustomHighlightLayer = forwardRef<HTMLDivElement, CustomHighlightLayerProps>(
  ({ highlightAreas, totalPages, scale }, ref) => {
    debugger;
    return (
      <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {Array.from({ length: totalPages }).map((_, pageIndex) => {
          const pageHighlights = highlightAreas.filter(h => h.pageIndex === pageIndex);
          
          // Get the actual rendered page element
          const pageElement = document.querySelector(
            `div.react-pdf__Page[data-page-number="${pageIndex + 1}"]`
          ) as HTMLDivElement;
          
          if (!pageElement) return null;
          
          return (
            <div
              key={pageIndex}
              style={{
                position: 'absolute',
                top: pageElement.offsetTop,
                left: pageElement.offsetLeft,
                width: pageElement.clientWidth,
                height: pageElement.clientHeight,
              }}
            >
              {pageHighlights.map((highlight, idx) =>
                highlight.textItems.map((textItem, itemIdx) => {
                  const style = calculateHighlightStyle(
                    textItem.item,
                    textItem.matchStartInItem,
                    textItem.matchEndInItem,
                    scale,
                    highlight.pageHeight
                  );
                  
                  return (
                    <div
                      key={`${idx}-${itemIdx}`}
                      style={style}
                      title={textItem.item.str.substring(
                        textItem.matchStartInItem,
                        textItem.matchEndInItem
                      )}
                    />
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    );
  }
);