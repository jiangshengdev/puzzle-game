export function getOverlap(
  min1: number,
  max1: number,
  min2: number,
  max2: number,
) {
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
}
