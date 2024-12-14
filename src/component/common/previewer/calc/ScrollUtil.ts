/**
 * all offset change based on base offset
 * which offset with the scale of 1
 * 
 * @param legacyScale 
 * @param newScale 
 * @param offset 
 * @returns 
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
  let baseOffset = offset / legacyScale;
  let newOffset = baseOffset * newScale;
  return newOffset;
};
