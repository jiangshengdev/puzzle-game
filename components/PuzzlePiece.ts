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

  draw(ctx: CanvasRenderingContext2D, debug: boolean) {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);

    const radius = 15;

    const isConvex = (direction: keyof Gaps, gap: string | null): boolean => {
      if (!gap) return false;
      return gap.includes(direction);
    };

    if (this.gaps.top) {
      const convex = isConvex("top", this.gaps.top);
      const midX = this.x + this.width / 2;
      if (convex) {
        ctx.lineTo(midX - radius, this.y);
        ctx.quadraticCurveTo(
          midX,
          this.y - radius * 1.5,
          midX + radius,
          this.y,
        );
      } else {
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

    ctx.clip();

    if (this.image) {
      const bgWidth = this.width * 2;
      const bgHeight = this.height * 2;

      const bgX = this.x + this.width / 2 - bgWidth / 2;
      const bgY = this.y + this.height / 2 - bgHeight / 2;

      const bgSX = this.sx - this.sWidth / 2;
      const bgSY = this.sy - this.sHeight / 2;

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

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    if (debug) {
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
