export interface Gaps {
  top: "topConvex" | "bottomConvex" | null;
  left: "leftConvex" | "rightConvex" | null;
  bottom: "topConvex" | "bottomConvex" | null;
  right: "leftConvex" | "rightConvex" | null;
}

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
  gaps: Gaps;

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
    this.group = null;
    this.number = number;
    this.zIndex = number;
    this.image = image;
    this.sx = sx;
    this.sy = sy;
    this.sWidth = sWidth;
    this.sHeight = sHeight;
    this.gaps = gaps;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 创建拼图块路径
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);

    const radius = 15;

    const isConvex = (direction: keyof Gaps, gap: string | null): boolean => {
      if (!gap) return false;
      return gap.includes(direction);
    };

    // 上边缘
    if (this.gaps.top) {
      const convex = isConvex("top", this.gaps.top);
      const midX = this.x + this.width / 2;
      if (convex) {
        // 凸起
        ctx.lineTo(midX - radius, this.y);
        ctx.quadraticCurveTo(
          midX,
          this.y - radius * 1.5,
          midX + radius,
          this.y,
        );
      } else {
        // 凹陷
        ctx.lineTo(midX - radius, this.y);
        ctx.quadraticCurveTo(
          midX,
          this.y + radius * 1.5,
          midX + radius,
          this.y,
        );
      }
    }
    ctx.lineTo(this.x + this.width, this.y);

    // 右边缘
    if (this.gaps.right) {
      const convex = isConvex("right", this.gaps.right);
      const midY = this.y + this.height / 2;
      if (convex) {
        ctx.lineTo(this.x + this.width, midY - radius);
        ctx.quadraticCurveTo(
          this.x + this.width + radius * 1.5,
          midY,
          this.x + this.width,
          midY + radius,
        );
      } else {
        ctx.lineTo(this.x + this.width, midY - radius);
        ctx.quadraticCurveTo(
          this.x + this.width - radius * 1.5,
          midY,
          this.x + this.width,
          midY + radius,
        );
      }
    }
    ctx.lineTo(this.x + this.width, this.y + this.height);

    // 下边缘
    if (this.gaps.bottom) {
      const convex = isConvex("bottom", this.gaps.bottom);
      const midX = this.x + this.width / 2;
      if (convex) {
        ctx.lineTo(midX + radius, this.y + this.height);
        ctx.quadraticCurveTo(
          midX,
          this.y + this.height + radius * 1.5,
          midX - radius,
          this.y + this.height,
        );
      } else {
        ctx.lineTo(midX + radius, this.y + this.height);
        ctx.quadraticCurveTo(
          midX,
          this.y + this.height - radius * 1.5,
          midX - radius,
          this.y + this.height,
        );
      }
    }
    ctx.lineTo(this.x, this.y + this.height);

    // 左边缘
    if (this.gaps.left) {
      const convex = isConvex("left", this.gaps.left);
      const midY = this.y + this.height / 2;
      if (convex) {
        ctx.lineTo(this.x, midY + radius);
        ctx.quadraticCurveTo(
          this.x - radius * 1.5,
          midY,
          this.x,
          midY - radius,
        );
      } else {
        ctx.lineTo(this.x, midY + radius);
        ctx.quadraticCurveTo(
          this.x + radius * 1.5,
          midY,
          this.x,
          midY - radius,
        );
      }
    }
    ctx.closePath();

    // 将剪切区域限定为拼图块形状
    ctx.clip();

    if (this.image) {
      // 计算 2x2 背景的尺寸
      const bgWidth = this.width * 2;
      const bgHeight = this.height * 2;

      // 计算绘制位置，使背景中心与拼图块中心对齐
      const bgX = this.x + this.width / 2 - bgWidth / 2;
      const bgY = this.y + this.height / 2 - bgHeight / 2;

      // 调整源图像的坐标，确保绘制正确的区域
      const bgSX = this.sx - this.sWidth / 2;
      const bgSY = this.sy - this.sHeight / 2;

      // 绘制 2x2 背景图像
      ctx.drawImage(
        this.image,
        bgSX,
        bgSY,
        this.sWidth * 2,
        this.sHeight * 2,
        bgX,
        bgY,
        bgWidth,
        bgHeight,
      );

      // 绘制拼图块图像
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
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    // 设置描边样式并绘制描边
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // 绘制数字和层级
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.number.toString(),
      this.x + this.width / 2,
      this.y + this.height / 2,
    );

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
}
