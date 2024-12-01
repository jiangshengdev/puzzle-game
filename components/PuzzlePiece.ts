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
    gaps: Gaps, // 新增
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
    this.gaps = gaps; // 新增
  }

  draw(ctx: CanvasRenderingContext2D) {
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
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

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

    // 修改绘制缝隙逻辑，确定凹陷或凸起
    const radius = 15;

    // Helper 函数判断是否凸起
    const isConvex = (direction: keyof Gaps, gap: string | null): boolean => {
      if (!gap) return false;
      return gap.includes(direction);
    };

    if (this.gaps.top) {
      const convex = isConvex("top", this.gaps.top);
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y, radius, Math.PI, 0, !convex);
      ctx.fillStyle = convex ? "blue" : "white";
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
        Math.PI,
        !convex,
      );
      ctx.fillStyle = convex ? "blue" : "white";
      ctx.fill();
    }
    if (this.gaps.left) {
      const convex = isConvex("left", this.gaps.left);
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y + this.height / 2,
        radius,
        Math.PI / 2,
        (3 * Math.PI) / 2,
        !convex,
      );
      ctx.fillStyle = convex ? "blue" : "white";
      ctx.fill();
    }
    if (this.gaps.right) {
      const convex = isConvex("right", this.gaps.right);
      ctx.beginPath();
      ctx.arc(
        this.x + this.width,
        this.y + this.height / 2,
        radius,
        (3 * Math.PI) / 2,
        Math.PI / 2,
        !convex,
      );
      ctx.fillStyle = convex ? "blue" : "white";
      ctx.fill();
    }
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
