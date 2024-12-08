import { PuzzlePiece } from "./PuzzlePiece";
import { getOverlap } from "@/components/puzzle/utils";

/**
 * 调整拼图组的位置，通过给定的偏移量。
 *
 * @param group - 需要调整位置的拼图组数组。
 * @param dx - X轴的偏移量。
 * @param dy - Y轴的偏移量。
 */
export function adjustGroupPosition(
  group: PuzzlePiece[],
  dx: number,
  dy: number,
) {
  group.forEach((piece) => {
    piece.x += dx;
    piece.y += dy;
  });
}

/**
 * 对齐移动的拼图块与目标拼图块在指定轴上。
 *
 * @param movedPiece - 被移动的拼图块。
 * @param targetPiece - 目标拼图块，用于对齐。
 * @param axis - 对齐的轴，"x" 或 "y"。
 */
export function alignPosition(
  movedPiece: PuzzlePiece,
  targetPiece: PuzzlePiece,
  axis: "x" | "y",
) {
  const offset = targetPiece[axis];
  const d = offset - movedPiece[axis];
  if (movedPiece.group) {
    adjustGroupPosition(
      movedPiece.group,
      axis === "x" ? d : 0,
      axis === "y" ? d : 0,
    );
  } else {
    movedPiece[axis] = offset;
  }
}

/**
 * 检查两个拼图块在指定轴上的对齐情况。
 *
 * @param pieceA - 第一个拼图块。
 * @param pieceB - 第二个拼图块。
 * @param axis - 检查的轴，"x" 或 "y"。
 * @returns 如果两个拼图块在指定轴上有重叠，则返回true，否则返回false。
 */
export function areAligned(
  pieceA: PuzzlePiece,
  pieceB: PuzzlePiece,
  axis: "x" | "y",
) {
  const overlap = getOverlap(
    pieceA[axis],
    pieceA[axis === "x" ? "width" : "height"] + pieceA[axis],
    pieceB[axis],
    pieceB[axis === "x" ? "width" : "height"] + pieceB[axis],
  );
  return overlap > 0;
}

/**
 * 合并两个拼图块的组。
 *
 * @param pieceA - 第一个拼图块。
 * @param pieceB - 第二个拼图块。
 */
export function mergeGroups(pieceA: PuzzlePiece, pieceB: PuzzlePiece) {
  if (pieceA.group && pieceB.group) {
    if (pieceA.group !== pieceB.group) {
      pieceB.group.forEach((piece) => {
        piece.group = pieceA.group;
        pieceA.group!.push(piece);
      });
    }
  } else if (pieceA.group) {
    pieceB.group = pieceA.group;
    pieceA.group.push(pieceB);
  } else if (pieceB.group) {
    pieceA.group = pieceB.group;
    pieceB.group.push(pieceA);
  } else {
    const newGroup = [pieceA, pieceB];
    pieceA.group = newGroup;
    pieceB.group = newGroup;
  }

  const newZIndex = Math.max(...pieceA.group!.map((p) => p.zIndex));
  pieceA.group!.forEach((piece) => {
    piece.zIndex = newZIndex;
  });
}
