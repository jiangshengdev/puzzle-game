export class PuzzlePiece {
  x: number;
  y: number;
  width: number;
  height: number;
  group: PuzzlePiece[] | null;
  number: number;
  zIndex: number;
  image: HTMLImageElement | null;
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
  edges: {
    top: "in" | "out" | "flat";
    right: "in" | "out" | "flat";
    bottom: "in" | "out" | "flat";
    left: "in" | "out" | "flat";
  };

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
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.group = null;
    this.number = number;
    this.zIndex = number; // 初始化 zIndex
    this.image = image;
    this.sx = sx;
    this.sy = sy;
    this.sWidth = sWidth;
    this.sHeight = sHeight;
    this.edges = { top: "flat", right: "flat", bottom: "flat", left: "flat" };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();

    const size = Math.min(this.width, this.height);
    const tabSize = size * 0.2; // 凸起或凹陷的大小

    // 绘制拼图块的形状
    this.drawPieceShape(ctx, tabSize);

    ctx.closePath();
    ctx.clip();

    // 绘制拼图块的图像部分
    if (this.image) {
      ctx.drawImage(
        this.image,
        this.sx,
        this.sy,
        this.sWidth,
        this.sHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    } else {
      ctx.fillStyle = "gray";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();

    // 绘制拼图块的边框
    ctx.save();
    ctx.beginPath();
    this.drawPieceShape(ctx, tabSize);
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 绘制数字
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.number.toString(),
      this.x + this.width / 2,
      this.y + this.height / 2,
    );

    // 显示 zIndex 数字在右下角
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      this.zIndex.toString(),
      this.x + this.width - 5,
      this.y + this.height - 5,
    );
  }

  isPointInside(px: number, py: number) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  alignTo(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }

  private drawPieceShape(ctx: CanvasRenderingContext2D, tabSize: number) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    ctx.moveTo(x, y);

    // 上边缘
    this.drawSide(ctx, x, y, x + w, y, this.edges.top, tabSize, true);

    // 右边缘
    this.drawSide(
      ctx,
      x + w,
      y,
      x + w,
      y + h,
      this.edges.right,
      tabSize,
      false,
    );

    // 下边缘
    this.drawSide(
      ctx,
      x + w,
      y + h,
      x,
      y + h,
      this.edges.bottom,
      tabSize,
      true,
    );

    // 左边缘
    this.drawSide(ctx, x, y + h, x, y, this.edges.left, tabSize, false);
  }

  private drawSide(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    edge: "in" | "out" | "flat",
    tabSize: number,
    isHorizontal: boolean,
  ) {
    const direction = edge === "in" ? -1 : 1;
    const length = isHorizontal ? toX - fromX : toY - fromY;
    const tabOffset = length / 2 - tabSize / 2;

    if (edge === "flat") {
      ctx.lineTo(toX, toY);
    } else if (isHorizontal) {
      ctx.lineTo(fromX + tabOffset, fromY);

      ctx.bezierCurveTo(
        fromX + tabOffset,
        fromY + tabSize * direction,
        fromX + tabOffset + tabSize,
        fromY + tabSize * direction,
        fromX + tabOffset + tabSize,
        fromY,
      );

      ctx.lineTo(toX, toY);
    } else {
      ctx.lineTo(fromX, fromY + tabOffset);

      ctx.bezierCurveTo(
        fromX + tabSize * direction,
        fromY + tabOffset,
        fromX + tabSize * direction,
        fromY + tabOffset + tabSize,
        fromX,
        fromY + tabOffset + tabSize,
      );

      ctx.lineTo(toX, toY);
    }
  }
}
