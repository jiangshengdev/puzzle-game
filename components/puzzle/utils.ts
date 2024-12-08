/**
 * 计算两个区间的重叠长度。
 *
 * @param min1 - 第一个区间的最小值。
 * @param max1 - 第一个区间的最大值。
 * @param min2 - 第二个区间的最小值。
 * @param max2 - 第二个区间的最大值。
 * @returns 两个区间的重叠长度，若无重叠则返回0。
 */
export function getOverlap(
  min1: number,
  max1: number,
  min2: number,
  max2: number,
) {
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
}
