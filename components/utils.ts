import { GapDirection, Gaps, PuzzlePiece } from "./PuzzlePiece";

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

export function areAligned(
  pieceA: PuzzlePiece,
  pieceB: PuzzlePiece,
  axis: "x" | "y",
) {
  const overlap = getOverlap(
    pieceA[axis],
    pieceA[axis] + pieceA[axis === "x" ? "width" : "height"],
    pieceB[axis],
    pieceB[axis] + pieceB[axis === "x" ? "width" : "height"],
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

  const newZIndex = Math.max(...pieceA.group!.map((p) => p.zIndex));
  pieceA.group!.forEach((piece) => {
    piece.zIndex = newZIndex;
  });
}

export function isConvex(
  direction: keyof Gaps,
  gap: GapDirection | null,
): boolean {
  if (!gap) return false;
  return gap.includes(direction);
}
