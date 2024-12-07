import { PuzzleDrawer } from "./PuzzleDrawer";
import { PuzzleSnapper } from "./PuzzleSnapper";
import { GapDirection, Gaps } from "./types";

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

  private drawer: PuzzleDrawer;
  private snapper: PuzzleSnapper;

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
    this.drawer = new PuzzleDrawer(this);
    this.snapper = new PuzzleSnapper(this);
  }

  draw(ctx: CanvasRenderingContext2D, debug: boolean) {
    this.drawer.draw(ctx, debug);
  }

  isPointInside(px: number, py: number) {
    const ctx = document.createElement("canvas").getContext("2d")!;
    return ctx.isPointInPath(this.path, px, py);
  }

  alignTo(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }

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

  private isConvex(direction: keyof Gaps, gap: GapDirection | null): boolean {
    if (!gap) return false;
    return gap.includes(direction);
  }
}
