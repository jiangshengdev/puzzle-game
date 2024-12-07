import { PuzzlePiece } from "./PuzzlePiece";
import {
  adjustGroupPosition,
  alignPosition,
  areAligned,
  mergeGroups,
} from "./PuzzleGroup";

export class PuzzleSnapper {
  private piece: PuzzlePiece;

  constructor(piece: PuzzlePiece) {
    this.piece = piece;
  }

  checkSnapping(
    pieces: PuzzlePiece[],
    columns: number,
    SNAP_DISTANCE: number,
    leftSidePieces: number[],
    rightSidePieces: number[],
  ) {
    const piecesToCheck = this.piece.group ? this.piece.group : [this.piece];

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

  private snapTo(piece: PuzzlePiece, offsetX: number, offsetY: number) {
    if (piece.group) {
      adjustGroupPosition(piece.group, offsetX, offsetY);
    } else {
      piece.x += offsetX;
      piece.y += offsetY;
    }
  }

  private mergeWith(otherPiece: PuzzlePiece) {
    mergeGroups(this.piece, otherPiece);
  }

  private align(piece: PuzzlePiece, otherPiece: PuzzlePiece, axis: "x" | "y") {
    alignPosition(piece, otherPiece, axis);
  }
}
