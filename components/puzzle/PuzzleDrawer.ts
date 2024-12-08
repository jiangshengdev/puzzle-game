import { PuzzlePiece } from "./PuzzlePiece";

/**
 * 类用于绘制拼图块及其组。
 */
export class PuzzleDrawer {
  static drawnGroups: Set<PuzzlePiece[]> = new Set();
  private piece: PuzzlePiece;

  /**
   * 创建一个PuzzleDrawer实例。
   *
   * @param piece - 需要绘制的拼图块。
   */
  constructor(piece: PuzzlePiece) {
    this.piece = piece;
  }

  /**
   * 在画布上绘制拼图块。
   *
   * @param ctx - CanvasRenderingContext2D对象，用于绘制。
   * @param debug - 是否开启调试模式。
   * @param puzzleComplete - 拼图是否完成。
   */
  draw(ctx: CanvasRenderingContext2D, debug: boolean, puzzleComplete: boolean) {
    const group = this.piece.group;

    // 检查拼图块是否属于一个组且该组尚未被绘制
    if (group && !PuzzleDrawer.drawnGroups.has(group)) {
      PuzzleDrawer.drawnGroups.add(group);

      const groupPath = new Path2D();

      // 为组中的每个拼图块创建路径并添加到组路径中
      group.forEach((p) => {
        p.createPaths();
        groupPath.addPath(p.drawPath);
      });

      ctx.save();

      // 设置阴影样式
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.fillStyle = "rgba(0, 0, 0, 1)";

      // 填充组路径
      ctx.fill(groupPath);

      ctx.restore();
    }

    // 创建单个拼图块的绘制路径
    this.piece.drawPath = new Path2D();
    this.piece.drawPath.moveTo(this.piece.x, this.piece.y);

    // 添加拼图块边缘路径
    this.createPath(this.piece.drawPath);

    ctx.save();
    ctx.beginPath();

    // 设置剪裁区域为拼图块路径
    ctx.clip(this.piece.drawPath);

    // 如果拼图块有图像，绘制图像
    if (this.piece.image) {
      const bgWidth = this.piece.width * 2;
      const bgHeight = this.piece.height * 2;

      // 计算图像在画布上的位置
      const bgX = this.piece.x + this.piece.width / 2 - bgWidth / 2;
      const bgY = this.piece.y + this.piece.height / 2 - bgHeight / 2;

      // 计算图像裁剪区域
      const bgSX = this.piece.sx - this.piece.sWidth / 2;
      const bgSY = this.piece.sy - this.piece.sHeight / 2;

      // 绘制裁剪后的图像到画布
      ctx.drawImage(
        this.piece.image,
        bgSX,
        bgSY,
        this.piece.sWidth * 2,
        this.piece.sHeight * 2,
        bgX,
        bgY,
        bgWidth,
        bgHeight,
      );
    } else {
      // 如果没有图像，填充灰色矩形
      ctx.fillStyle = "gray";
      ctx.fillRect(
        this.piece.x,
        this.piece.y,
        this.piece.width,
        this.piece.height,
      );
    }

    ctx.restore();

    // 设置描边样式
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    if (!puzzleComplete) {
      ctx.lineWidth = 1;
      ctx.stroke(this.piece.drawPath);
    }

    // 如果开启调试模式，绘制拼图块编号和zIndex
    if (debug) {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 绘制拼图块编号
      ctx.fillText(
        this.piece.number.toString(),
        this.piece.x + this.piece.width / 2,
        this.piece.y + this.piece.height / 2,
      );

      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      // 绘制拼图块的zIndex
      ctx.fillText(
        this.piece.zIndex.toString(),
        this.piece.x + this.piece.width - 5,
        this.piece.y + this.piece.height - 5,
      );
    }
  }

  /**
   * 创建拼图块的路径。
   *
   * @param path - Path2D对象，用于定义路径。
   */
  private createPath(path: Path2D) {
    // 添加顶部边缘路径
    this.piece.drawTopSide(path);
    // 添加右侧边缘路径
    this.piece.drawRightSide(path);
    // 添加底部边缘路径
    this.piece.drawBottomSide(path);
    // 添加左侧边缘路径
    this.piece.drawLeftSide(path);
  }
}
