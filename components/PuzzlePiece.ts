import { isConvex } from "./utils";

export type HorizontalGapDirection = "leftConvex" | "rightConvex";
export type VerticalGapDirection = "topConvex" | "bottomConvex";
export type GapDirection = HorizontalGapDirection | VerticalGapDirection;

export interface Gap {
  direction: GapDirection;
}

export interface Gaps {
  top: VerticalGapDirection | null;
  left: HorizontalGapDirection | null;
  bottom: VerticalGapDirection | null;
  right: HorizontalGapDirection | null;
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
  path: Path2D;

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
    this.path = new Path2D();
  }

  draw(ctx: CanvasRenderingContext2D, debug: boolean) {
    this.path = new Path2D();
    this.path.moveTo(this.x, this.y);

    this.createPath(this.path);

    ctx.save();
    ctx.beginPath();
    ctx.stroke(this.path);
    ctx.clip(this.path);

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
    const ctx = document.createElement("canvas").getContext("2d")!;
    return ctx.isPointInPath(this.path, px, py);
  }

  alignTo(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }

  private createPath(path: Path2D) {
    this.drawSide(path, "top");
    this.drawSide(path, "right");
    this.drawSide(path, "bottom");
    this.drawSide(path, "left");
    path.closePath();
  }

  private drawSide(path: Path2D, side: "top" | "right" | "bottom" | "left") {
    const gap = this.gaps[side];
    if (gap) {
      const convex = isConvex(side, gap);
      let midX, midY;
      const r =
        side === "top" || side === "bottom" ? this.width / 6 : this.height / 6;
      switch (side) {
        case "top":
          midX = this.x + this.width / 2;
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
          break;
        case "right":
          midY = this.y + this.height / 2;
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
          break;
        case "bottom":
          midX = this.x + this.width / 2;
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
          break;
        case "left":
          midY = this.y + this.height / 2;
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
          break;
      }
    } else {
      switch (side) {
        case "top":
          path.lineTo(this.x + this.width, this.y);
          break;
        case "right":
          path.lineTo(this.x + this.width, this.y + this.height);
          break;
        case "bottom":
          path.lineTo(this.x, this.y + this.height);
          break;
        case "left":
          path.lineTo(this.x, this.y);
          break;
      }
    }
  }
}
