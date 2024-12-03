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
    // if (this.image) {
    //   ctx.drawImage(
    //     this.image,
    //     this.sx,
    //     this.sy,
    //     this.sWidth,
    //     this.sHeight,
    //     this.x,
    //     this.y,
    //     this.width,
    //     this.height,
    //   );
    //   ctx.restore();

    //   // 计算 2x2 背景的尺寸
    //   const bgWidth = this.width * 2;
    //   const bgHeight = this.height * 2;

    //   // 计算绘制位置，使背景中心与拼图块中心对齐
    //   const bgX = this.x + this.width / 2 - bgWidth / 2;
    //   const bgY = this.y + this.height / 2 - bgHeight / 2;

    //   // 调整源图像的坐标，确保绘制正确的区域
    //   const bgSX = this.sx - this.sWidth / 2;
    //   const bgSY = this.sy - this.sHeight / 2;

    //   ctx.drawImage(
    //     this.image,
    //     bgSX,
    //     bgSY,
    //     this.sWidth * 2,
    //     this.sHeight * 2,
    //     bgX,
    //     bgY,
    //     bgWidth,
    //     bgHeight,
    //   );
    // } else {
    //   ctx.fillStyle = "gray";
    //   ctx.fillRect(this.x, this.y, this.width, this.height);
    //   ctx.strokeStyle = "black";
    //   ctx.strokeRect(this.x, this.y, this.width, this.height);
    // }

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    const radius = 15;

    const isConvex = (direction: keyof Gaps, gap: string | null): boolean => {
      if (!gap) return false;
      return gap.includes(direction);
    };

    if (this.gaps.top) {
      const convex = isConvex("top", this.gaps.top);
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y, radius, 0, Math.PI * 2);

      if (convex) {
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.globalCompositeOperation = "destination-out";
      }
      ctx.fill();
    }

    if (this.gaps.bottom) {
      const convex = isConvex("bottom", this.gaps.bottom);
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height,
        radius,
        0,
        Math.PI * 2,
      );

      if (convex) {
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.globalCompositeOperation = "destination-out";
      }
      ctx.fill();
    }

    if (this.gaps.left) {
      const convex = isConvex("left", this.gaps.left);
      ctx.beginPath();
      ctx.arc(this.x, this.y + this.height / 2, radius, 0, Math.PI * 2);

      if (convex) {
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.globalCompositeOperation = "destination-out";
      }
      ctx.fill();
    }

    if (this.gaps.right) {
      const convex = isConvex("right", this.gaps.right);
      ctx.beginPath();
      ctx.arc(
        this.x + this.width,
        this.y + this.height / 2,
        radius,
        0,
        Math.PI * 2,
      );

      if (convex) {
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.globalCompositeOperation = "destination-out";
      }
      ctx.fill();
    }

    ctx.restore();

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
