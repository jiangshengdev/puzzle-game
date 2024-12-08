import { PuzzlePiece } from "./PuzzlePiece";
import {
  adjustGroupPosition,
  alignPosition,
  areAligned,
  mergeGroups,
} from "./PuzzleGroup";
import { SNAP_DISTANCE } from "@/components/puzzle/constants";

/**
 * 类用于处理拼图块的自动对齐和组合并逻辑。
 */
export class PuzzleSnapper {
  private readonly piece: PuzzlePiece;

  /**
   * 创建一个PuzzleSnapper实例。
   *
   * @param piece - 需要处理对齐的拼图块。
   */
  constructor(piece: PuzzlePiece) {
    this.piece = piece;
  }

  /**
   * 检查并处理拼图块的对齐。
   *
   * @param pieces - 当前所有的拼图块。
   * @param columns - 拼图的总列数。
   * @param leftSidePieces - 左侧边缘的拼图块编号数组。
   * @param rightSidePieces - 右侧边缘的拼图块编号数组。
   */
  checkSnapping(
    pieces: PuzzlePiece[],
    columns: number,
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

        this.handleTopSnapping(piece, otherPiece, columns);
        this.handleBottomSnapping(piece, otherPiece, columns);
        this.handleLeftSnapping(
          piece,
          otherPiece,
          leftSidePieces,
          rightSidePieces,
        );
        this.handleRightSnapping(
          piece,
          otherPiece,
          leftSidePieces,
          rightSidePieces,
        );
      });
    });
  }

  /**
   * 处理顶部对齐逻辑。
   *
   * @param piece - 当前拼图块。
   * @param otherPiece - 相邻的拼图块。
   * @param columns - 拼图的总列数。
   */
  private handleTopSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
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

  /**
   * 处理底部对齐逻辑。
   *
   * @param piece - 当前拼图块。
   * @param otherPiece - 相邻的拼图块。
   * @param columns - 拼图的总列数。
   */
  private handleBottomSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
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

  /**
   * 处理左侧对齐逻辑。
   *
   * @param piece - 当前拼图块。
   * @param otherPiece - 相邻的拼图块。
   * @param leftSidePieces - 左侧边缘的拼图块编号数组。
   * @param rightSidePieces - 右侧边缘的拼图块编号数组。
   */
  private handleLeftSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
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

  /**
   * 处理右侧对齐逻辑。
   *
   * @param piece - 当前拼图块。
   * @param otherPiece - 相邻的拼图块。
   * @param leftSidePieces - 左侧边缘的拼图块编号数组。
   * @param rightSidePieces - 右侧边缘的拼图块编号数组。
   */
  private handleRightSnapping(
    piece: PuzzlePiece,
    otherPiece: PuzzlePiece,
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

  /**
   * 将拼图块移动到指定的偏移位置。
   *
   * @param piece - 需要移动的拼图块。
   * @param offsetX - X轴的偏移量。
   * @param offsetY - Y轴的偏移量。
   */
  private snapTo(piece: PuzzlePiece, offsetX: number, offsetY: number) {
    if (piece.group) {
      adjustGroupPosition(piece.group, offsetX, offsetY);
    } else {
      piece.x += offsetX;
      piece.y += offsetY;
    }
  }

  /**
   * 合并当前拼图块与另一个拼图块的组。
   *
   * @param otherPiece - 需要合并的另一个拼图块。
   */
  private mergeWith(otherPiece: PuzzlePiece) {
    mergeGroups(this.piece, otherPiece);
  }

  /**
   * 对齐两个拼图块在指定轴上的位置。
   *
   * @param piece - 当前拼图块。
   * @param otherPiece - 目标拼图块。
   * @param axis - 对齐的轴，"x" 或 "y"。
   */
  private align(piece: PuzzlePiece, otherPiece: PuzzlePiece, axis: "x" | "y") {
    alignPosition(piece, otherPiece, axis);
  }
}
