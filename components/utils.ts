import { PuzzlePiece } from "./PuzzlePiece";

export const SNAP_DISTANCE = 20;

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

export function alignHorizontally(
  movedPiece: PuzzlePiece,
  targetPiece: PuzzlePiece,
) {
  const offsetX = targetPiece.x;
  const dx = offsetX - movedPiece.x;
  if (movedPiece.group) {
    adjustGroupPosition(movedPiece.group, dx, 0);
  } else {
    movedPiece.x = offsetX;
  }
}

export function alignVertically(
  movedPiece: PuzzlePiece,
  targetPiece: PuzzlePiece,
) {
  const offsetY = targetPiece.y;
  const dy = offsetY - movedPiece.y;
  if (movedPiece.group) {
    adjustGroupPosition(movedPiece.group, 0, dy);
  } else {
    movedPiece.y = offsetY;
  }
}

export function areAlignedVertically(pieceA: PuzzlePiece, pieceB: PuzzlePiece) {
  const overlap = getOverlap(
    pieceA.y,
    pieceA.y + pieceA.height,
    pieceB.y,
    pieceB.y + pieceB.height,
  );
  return overlap > 0;
}

export function areAlignedHorizontally(
  pieceA: PuzzlePiece,
  pieceB: PuzzlePiece,
) {
  const overlap = getOverlap(
    pieceA.x,
    pieceA.x + pieceA.width,
    pieceB.x,
    pieceB.x + pieceB.width,
  );
  return overlap > 0;
}

export function getOverlap(
  min1: number,
  max1: number,
  min2: number,
  max2: number,
) {
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
}

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

  // 统一合并后的zIndex
  const newZIndex = Math.max(...pieceA.group!.map((p) => p.zIndex));
  pieceA.group!.forEach((piece) => {
    piece.zIndex = newZIndex;
  });
}
