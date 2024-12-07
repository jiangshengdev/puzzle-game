import {
  adjustGroupPosition,
  alignPosition,
  areAligned,
  mergeGroups,
} from "./PuzzleGroup";

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
    }

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

  checkSnapping(
    pieces: PuzzlePiece[],
    columns: number,
    SNAP_DISTANCE: number,
    leftSidePieces: number[],
    rightSidePieces: number[],
  ) {
    const piecesToCheck = this.group ? this.group : [this];

    piecesToCheck.forEach((piece) => {
      const adjacentNumbers = [
        piece.number - 1,
        piece.number + 1,
        piece.number - columns,
        piece.number + columns,
      ];

      const adjacentPieces = pieces.filter((otherPiece) =>
        adjacentNumbers.includes(otherPiece.number),
      );

      adjacentPieces.forEach((otherPiece) => {
        if (otherPiece === piece) return;

        this.handleTopSnapping(piece, otherPiece, SNAP_DISTANCE, columns);
        this.handleBottomSnapping(piece, otherPiece, SNAP_DISTANCE, columns);
        this.handleLeftSnapping(
          piece,
          otherPiece,
          SNAP_DISTANCE,
          leftSidePieces,
          rightSidePieces,
        );
        this.handleRightSnapping(
          piece,
          otherPiece,
          SNAP_DISTANCE,
          leftSidePieces,
          rightSidePieces,
        );
      });
    });
  }

  snapTo(piece: PuzzlePiece, offsetX: number, offsetY: number) {
    if (piece.group) {
      adjustGroupPosition(piece.group, offsetX, offsetY);
    } else {
      piece.x += offsetX;
      piece.y += offsetY;
    }
  }

  mergeWith(otherPiece: PuzzlePiece) {
    mergeGroups(this, otherPiece);
  }

  align(piece: PuzzlePiece, otherPiece: PuzzlePiece, axis: "x" | "y") {
    alignPosition(piece, otherPiece, axis);
  }

  private handleTopSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
    SNAP_DISTANCE: number,
    columns: number,
  ) {
    const numberDifference = Math.abs(piece.number - otherPiece.number);

    if (
      Math.abs(piece.y - (otherPiece.y + otherPiece.height)) < SNAP_DISTANCE &&
      Math.abs(piece.x - otherPiece.x) < SNAP_DISTANCE &&
      numberDifference === columns &&
      piece.number > otherPiece.number
    ) {
      if (areAligned(piece, otherPiece, "x")) {
        const offsetY = otherPiece.y + otherPiece.height;
        this.snapTo(piece, 0, offsetY - piece.y);
        this.align(piece, otherPiece, "x");
        this.mergeWith(otherPiece);
      }
    }
  }

  private handleBottomSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
    SNAP_DISTANCE: number,
    columns: number,
  ) {
    const numberDifference = Math.abs(piece.number - otherPiece.number);

    if (
      Math.abs(piece.y + piece.height - otherPiece.y) < SNAP_DISTANCE &&
      Math.abs(piece.x - otherPiece.x) < SNAP_DISTANCE &&
      numberDifference === columns &&
      piece.number < otherPiece.number
    ) {
      if (areAligned(piece, otherPiece, "x")) {
        const offsetY = otherPiece.y - piece.height;
        this.snapTo(piece, 0, offsetY - piece.y);
        this.align(piece, otherPiece, "x");
        this.mergeWith(otherPiece);
      }
    }
  }

  private handleLeftSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
    SNAP_DISTANCE: number,
    leftSidePieces: number[],
    rightSidePieces: number[],
  ) {
    if (
      Math.abs(piece.x - (otherPiece.x + otherPiece.width)) < SNAP_DISTANCE &&
      Math.abs(piece.y - otherPiece.y) < SNAP_DISTANCE &&
      piece.number === otherPiece.number + 1 &&
      !(
        (rightSidePieces.includes(otherPiece.number) &&
          leftSidePieces.includes(piece.number)) ||
        (rightSidePieces.includes(piece.number) &&
          leftSidePieces.includes(otherPiece.number))
      )
    ) {
      if (areAligned(piece, otherPiece, "y")) {
        const offsetX = otherPiece.x + otherPiece.width;
        this.snapTo(piece, offsetX - piece.x, 0);
        this.align(piece, otherPiece, "y");
        this.mergeWith(otherPiece);
      }
    }
  }

  private handleRightSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
    SNAP_DISTANCE: number,
    leftSidePieces: number[],
    rightSidePieces: number[],
  ) {
    if (
      Math.abs(piece.x + piece.width - otherPiece.x) < SNAP_DISTANCE &&
      Math.abs(piece.y - otherPiece.y) < SNAP_DISTANCE &&
      piece.number === otherPiece.number - 1 &&
      !(
        (rightSidePieces.includes(otherPiece.number) &&
          leftSidePieces.includes(piece.number)) ||
        (rightSidePieces.includes(piece.number) &&
          leftSidePieces.includes(otherPiece.number))
      )
    ) {
      if (areAligned(piece, otherPiece, "y")) {
        const offsetX = otherPiece.x - piece.width;
        this.snapTo(piece, offsetX - piece.x, 0);
        this.align(piece, otherPiece, "y");
        this.mergeWith(otherPiece);
      }
    }
  }

  private createPath(path: Path2D) {
    this.drawTopSide(path);
    this.drawRightSide(path);
    this.drawBottomSide(path);
    this.drawLeftSide(path);
    path.closePath();
  }

  private drawTopSide(path: Path2D) {
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

  private drawRightSide(path: Path2D) {
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

  private drawBottomSide(path: Path2D) {
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

  private drawLeftSide(path: Path2D) {
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
