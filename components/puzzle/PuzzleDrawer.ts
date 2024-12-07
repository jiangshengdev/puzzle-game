import { PuzzlePiece } from "./PuzzlePiece";

export class PuzzleDrawer {
  static drawnGroups: Set<PuzzlePiece[]> = new Set();
  private piece: PuzzlePiece;

  constructor(piece: PuzzlePiece) {
    this.piece = piece;
  }

  draw(ctx: CanvasRenderingContext2D, debug: boolean, puzzleComplete: boolean) {
    const group = this.piece.group;
    if (group && !PuzzleDrawer.drawnGroups.has(group)) {
      PuzzleDrawer.drawnGroups.add(group);

      const groupPath = new Path2D();
      group.forEach((p) => {
        p.createPaths();
        groupPath.addPath(p.drawPath);
      });

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.fillStyle = "rgba(0, 0, 0, 1)";

      ctx.fill(groupPath);

      ctx.restore();
    }

    this.piece.drawPath = new Path2D();
    this.piece.drawPath.moveTo(this.piece.x, this.piece.y);

    this.createPath(this.piece.drawPath);

    ctx.save();
    ctx.beginPath();
    ctx.clip(this.piece.drawPath);

    if (this.piece.image) {
      const bgWidth = this.piece.width * 2;
      const bgHeight = this.piece.height * 2;

      const bgX = this.piece.x + this.piece.width / 2 - bgWidth / 2;
      const bgY = this.piece.y + this.piece.height / 2 - bgHeight / 2;

      const bgSX = this.piece.sx - this.piece.sWidth / 2;
      const bgSY = this.piece.sy - this.piece.sHeight / 2;

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
      ctx.fillStyle = "gray";
      ctx.fillRect(
        this.piece.x,
        this.piece.y,
        this.piece.width,
        this.piece.height,
      );
    }

    ctx.restore();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    if (!puzzleComplete) {
      ctx.lineWidth = 1;
      ctx.stroke(this.piece.drawPath);
    }

    if (debug) {
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this.piece.number.toString(),
        this.piece.x + this.piece.width / 2,
        this.piece.y + this.piece.height / 2,
      );

      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        this.piece.zIndex.toString(),
        this.piece.x + this.piece.width - 5,
        this.piece.y + this.piece.height - 5,
      );
    }
  }

  private createPath(path: Path2D) {
    this.piece.drawTopSide(path);
    this.piece.drawRightSide(path);
    this.piece.drawBottomSide(path);
    this.piece.drawLeftSide(path);
  }
}
