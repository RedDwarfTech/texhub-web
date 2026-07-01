/**
 * all offset change based on base offset
 * which offset with the scale of 1
 */
export const getNewScaleOffsetPosition = (
  legacyScale: number,
  newScale: number,
  offset: number
) => {
  if (legacyScale <= 0) {
    legacyScale = 0.1;
  }
  if (newScale <= 0) {
    newScale = 0.1;
  }
  const baseOffset = offset / legacyScale;
  return baseOffset * newScale;
};

export interface ScrollAnchor {
  viewportCenterY: number;
  scale: number;
}

export const captureScrollAnchor = (
  scrollTop: number,
  clientHeight: number,
  scale: number
): ScrollAnchor => ({
  viewportCenterY: scrollTop + clientHeight / 2,
  scale,
});

export const restoreScrollFromAnchor = (
  anchor: ScrollAnchor,
  newScale: number,
  clientHeight: number
): number => {
  const scaleRatio = newScale / anchor.scale;
  const newCenterY = anchor.viewportCenterY * scaleRatio;
  return Math.max(0, newCenterY - clientHeight / 2);
};
