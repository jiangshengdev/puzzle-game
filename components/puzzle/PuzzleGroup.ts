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
  // 遍历每个拼图块并调整其位置
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
  // 获取目标拼图块在指定轴上的位置
  const offset = targetPiece[axis];

  // 计算需要调整的距离
  const d = offset - movedPiece[axis];

  // 如果被移动的拼图块属于一个组，调整整个组的位置
  if (movedPiece.group) {
    adjustGroupPosition(
      movedPiece.group,
      axis === "x" ? d : 0,
      axis === "y" ? d : 0,
    );
  } else {
    // 如果拼图块不属于任何组，直接调整其位置
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
  // 计算两个拼图块在指定轴上的重叠部分
  const overlap = getOverlap(
    pieceA[axis],
    pieceA[axis === "x" ? "width" : "height"] + pieceA[axis],
    pieceB[axis],
    pieceB[axis === "x" ? "width" : "height"] + pieceB[axis],
  );

  // 如果重叠部分大于0，表示对齐
  return overlap > 0;
}

/**
 * 合并两个拼图块的组。
 *
 * @param pieceA - 第一个拼图块。
 * @param pieceB - 第二个拼图块。
 */
export function mergeGroups(pieceA: PuzzlePiece, pieceB: PuzzlePiece) {
  // 如果两个拼图块都已经属于某个组
  if (pieceA.group && pieceB.group) {
    // 如果它们属于不同的组，则将pieceB的组合并到pieceA的组中
    if (pieceA.group !== pieceB.group) {
      pieceB.group.forEach((piece) => {
        piece.group = pieceA.group;
        pieceA.group!.push(piece);
      });
    }
  }
  // 如果只有pieceA属于一个组
  else if (pieceA.group) {
    // 将pieceB加入到pieceA的组中
    pieceB.group = pieceA.group;
    pieceA.group.push(pieceB);
  }
  // 如果只有pieceB属于一个组
  else if (pieceB.group) {
    // 将pieceA加入到pieceB的组中
    pieceA.group = pieceB.group;
    pieceB.group.push(pieceA);
  }
  // 如果两个拼图块都不属于任何组
  else {
    // 创建一个新的组，并将两个拼图块加入其中
    const newGroup = [pieceA, pieceB];
    pieceA.group = newGroup;
    pieceB.group = newGroup;
  }

  // 计算新组的最大zIndex，用于确保绘制顺序
  const newZIndex = Math.max(...pieceA.group!.map((p) => p.zIndex));

  // 更新组内所有拼图块的zIndex
  pieceA.group!.forEach((piece) => {
    piece.zIndex = newZIndex;
  });
}
