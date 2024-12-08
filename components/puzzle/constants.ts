/**
 * 拼图的总行数。
 */
export const ROWS = 4;

/**
 * 拼图的总列数。
 */
export const COLUMNS = 6;

/**
 * 画布的最小宽度。
 */
export const CANVAS_MIN_WIDTH = 800;

/**
 * 画布的最小高度。
 */
export const CANVAS_MIN_HEIGHT = 600;

/**
 * 拼图块对齐的最大距离，单位为像素。
 */
export const SNAP_DISTANCE = 20;

/**
 * 获取当前窗口的画布尺寸，确保不小于最小尺寸。
 *
 * @returns 包含画布宽度和高度的对象。
 */
export function getCanvasDimensions(): { width: number; height: number } {
  const width = Math.max(window.innerWidth, CANVAS_MIN_WIDTH);
  const height = Math.max(window.innerHeight, CANVAS_MIN_HEIGHT);
  return { width, height };
}
