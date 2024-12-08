export const ROWS = 4;
export const COLUMNS = 6;
export const CANVAS_MIN_WIDTH = 800;
export const CANVAS_MIN_HEIGHT = 600;
export const SNAP_DISTANCE = 20;

export function getCanvasDimensions(): { width: number; height: number } {
  const width = Math.max(window.innerWidth, CANVAS_MIN_WIDTH);
  const height = Math.max(window.innerHeight, CANVAS_MIN_HEIGHT);
  return { width, height };
}
