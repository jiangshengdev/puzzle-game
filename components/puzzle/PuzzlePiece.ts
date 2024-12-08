import { PuzzleDrawer } from "./PuzzleDrawer";
import { PuzzleSnapper } from "./PuzzleSnapper";
import { GapDirection, Gaps } from "./types";

/**
 * 类表示一个拼图块，包含位置、大小、图像信息及其边缘的间隙信息。
 */
export class PuzzlePiece {
  x: number;
  y: number;
  width: number;
  height: number;
  group: PuzzlePiece[];
  number: number;
  zIndex: number;
  image: HTMLImageElement | null;
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
  gaps: Gaps;
  drawPath: Path2D;
  clickPath: Path2D;

  private drawer: PuzzleDrawer;
  private snapper: PuzzleSnapper;

  /**
   * 创建一个PuzzlePiece实例。
   *
   * @param x - 拼图块的X坐标。
   * @param y - 拼图块的Y坐标。
   * @param width - 拼图块的宽度。
   * @param height - 拼图块的高度。
   * @param number - 拼图块的编号。
   * @param image - 拼图块对应的图像元素，若无则为null。
   * @param sx - 图像裁剪的起始X坐标。
   * @param sy - 图像裁剪的起始Y坐标。
   * @param sWidth - 图像裁剪的宽度。
   * @param sHeight - 图像裁剪的高度。
   * @param gaps - 拼图块四周的间隙信息。
   */
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    number: number,
    image: HTMLImageElement | null,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    gaps: Gaps,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.group = [];
    this.number = number;
    this.zIndex = number;
    this.image = image;
    this.sx = sx;
    this.sy = sy;
    this.sWidth = sWidth;
    this.sHeight = sHeight;
    this.gaps = gaps;
    this.drawPath = new Path2D();
    this.clickPath = new Path2D();
    this.drawer = new PuzzleDrawer(this);
    this.snapper = new PuzzleSnapper(this);
  }

  /**
   * 判断一个点是否在拼图块的点击区域内。
   *
   * @param px - 点的X坐标。
   * @param py - 点的Y坐标。
   * @returns 如果点在拼图块内，则返回true，否则返回false。
   */
  isPointInside(px: number, py: number) {
    const ctx = document.createElement("canvas").getContext("2d")!;
    return ctx.isPointInPath(this.clickPath, px, py);
  }

  /**
   * 绘制拼图块到画布上。
   *
   * @param ctx - CanvasRenderingContext2D对象，用于绘制。
   * @param debug - 是否开启调试模式。
   * @param puzzleComplete - 拼图是否完成。
   */
  draw(ctx: CanvasRenderingContext2D, debug: boolean, puzzleComplete: boolean) {
    this.createPaths();
    this.drawer.draw(ctx, debug, puzzleComplete);
  }

  /**
   * 对齐拼图块到指定的位置。
   *
   * @param newX - 新的X坐标。
   * @param newY - 新的Y坐标。
   */
  alignTo(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }

  /**
   * 检查并处理拼图块的自动对齐。
   *
   * @param pieces - 当前所有的拼图块。
   * @param columns - 拼图的总列数。
   * @param leftSidePieces - 左侧边缘的拼图块编号数组。
   * @param rightSidePieces - 右侧边缘的拼图块编号数组。
   */
  checkSnapping(
    pieces: PuzzlePiece[],
    columns: number,
    leftSidePieces: number[],
    rightSidePieces: number[],
  ) {
    this.snapper.checkSnapping(
      pieces,
      columns,
      leftSidePieces,
      rightSidePieces,
    );
  }

  /**
   * 绘制拼图块的顶部边缘到路径。
   *
   * @param path - Path2D对象，用于定义路径。
   */
  drawTopSide(path: Path2D) {
    const gap = this.gaps["top"];
    if (gap) {
      const convex = this.isConvex("top", gap);
      const r = this.width / 6;
      const midX = this.x + this.width / 2;
      path.lineTo(midX - r, this.y);
      path.lineTo(this.x + this.width / 3, this.y);
      path.arc(
        midX,
        convex ? this.y - r : this.y + r,
        r,
        !convex ? 0 : Math.PI,
        !convex ? Math.PI : 0,
        !convex,
      );
      path.lineTo(this.x + (2 * this.width) / 3, this.y);
      path.lineTo(this.x + this.width, this.y);
    } else {
      path.lineTo(this.x + this.width, this.y);
    }
  }

  /**
   * 绘制拼图块的右侧边缘到路径。
   *
   * @param path - Path2D对象，用于定义路径。
   */
  drawRightSide(path: Path2D) {
    const gap = this.gaps["right"];
    if (gap) {
      const convex = this.isConvex("right", gap);
      const r = this.height / 6;
      const midY = this.y + this.height / 2;
      path.lineTo(this.x + this.width, this.y);
      path.lineTo(this.x + this.width, midY - r);
      path.arc(
        convex ? this.x + this.width + r : this.x + this.width - r,
        midY,
        r,
        !convex ? -Math.PI / 2 : Math.PI / 2,
        !convex ? Math.PI / 2 : -Math.PI / 2,
        !convex,
      );
      path.lineTo(this.x + this.width, midY + r);
      path.lineTo(this.x + this.width, this.y + this.height);
    } else {
      path.lineTo(this.x + this.width, this.y + this.height);
    }
  }

  /**
   * 绘制拼图块的底部边缘到路径。
   *
   * @param path - Path2D对象，用于定义路径。
   */
  drawBottomSide(path: Path2D) {
    const gap = this.gaps["bottom"];
    if (gap) {
      const convex = this.isConvex("bottom", gap);
      const r = this.width / 6;
      const midX = this.x + this.width / 2;
      path.lineTo(this.x + this.width, this.y + this.height);
      path.lineTo(this.x + (2 * this.width) / 3, this.y + this.height);
      path.arc(
        midX,
        convex ? this.y + this.height + r : this.y + this.height - r,
        r,
        convex ? Math.PI : 0,
        convex ? 0 : Math.PI,
        !convex,
      );
      path.lineTo(this.x + this.width / 3, this.y + this.height);
      path.lineTo(this.x, this.y + this.height);
    } else {
      path.lineTo(this.x, this.y + this.height);
    }
  }

  /**
   * 绘制拼图块的左侧边缘到路径。
   *
   * @param path - Path2D对象，用于定义路径。
   */
  drawLeftSide(path: Path2D) {
    const gap = this.gaps["left"];
    if (gap) {
      const convex = this.isConvex("left", gap);
      const r = this.height / 6;
      const midY = this.y + this.height / 2;
      path.lineTo(this.x, this.y + this.height);
      path.lineTo(this.x, this.y + (2 * this.height) / 3);
      path.arc(
        convex ? this.x - r : this.x + r,
        midY,
        r,
        convex ? Math.PI / 2 : -Math.PI / 2,
        convex ? -Math.PI / 2 : Math.PI / 2,
        !convex,
      );
      path.lineTo(this.x, this.y + this.height / 3);
      path.lineTo(this.x, this.y);
    } else {
      path.lineTo(this.x, this.y);
    }
  }

  /**
   * 创建拼图块的绘制路径和点击路径。
   */
  createPaths() {
    this.drawPath = new Path2D();
    this.drawPath.moveTo(this.x, this.y);
    this.drawTopSide(this.drawPath);
    this.drawRightSide(this.drawPath);
    this.drawBottomSide(this.drawPath);
    this.drawLeftSide(this.drawPath);
    this.drawPath.closePath();

    this.clickPath = new Path2D();
    this.clickPath.moveTo(this.x, this.y);
    this.drawTopSide(this.clickPath);
    this.drawRightSide(this.clickPath);
    this.drawBottomSide(this.clickPath);
    this.drawLeftSide(this.clickPath);
    this.clickPath.closePath();
  }

  /**
   * 判断指定方向的间隙是否为凸形。
   *
   * @param direction - 方向，"top" | "right" | "bottom" | "left"。
   * @param gap - 间隙的方向。
   * @returns 如果是凸形则返回true，否则返回false。
   */
  private isConvex(direction: keyof Gaps, gap: GapDirection | null): boolean {
    if (!gap) return false;
    return gap.includes(direction);
  }
}
