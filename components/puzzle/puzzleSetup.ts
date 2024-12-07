import {
  Gap,
  Gaps,
  HorizontalGapDirection,
  PuzzlePiece,
  VerticalGapDirection,
} from "./PuzzlePiece";
import React from "react";

export function initializePieces(
  randomizePositions: boolean,
  image: HTMLImageElement | null,
  horizontalGaps: Gap[][],
  verticalGaps: Gap[][],
  rows: number,
  columns: number,
  setLeftSidePieces: React.Dispatch<React.SetStateAction<number[]>>,
  setRightSidePieces: React.Dispatch<React.SetStateAction<number[]>>,
  setPieces: React.Dispatch<React.SetStateAction<PuzzlePiece[]>>,
  piecesRef: React.MutableRefObject<PuzzlePiece[]>,
) {
  if (!image) return;

  const initialPieces: PuzzlePiece[] = [];
  const canvasWidth = 800;
  const canvasHeight = 600;
  const spacingX = canvasWidth / (columns + 1);
  const spacingY = canvasHeight / (rows + 1);

  const centerX = image.width / 2;
  const centerY = image.height / 2;

  const gridAspectRatio = columns / rows;
  const imageAspectRatio = image.width / image.height;

  let cropWidth: number;
  let cropHeight: number;

  if (imageAspectRatio > gridAspectRatio) {
    cropHeight = image.height;
    cropWidth = cropHeight * gridAspectRatio;
  } else {
    cropWidth = image.width;
    cropHeight = cropWidth / gridAspectRatio;
  }

  const startX = centerX - cropWidth / 2;
  const startY = centerY - cropHeight / 2;

  const pieceWidth = cropWidth / columns;
  const pieceHeight = cropHeight / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const number = row * columns + col + 1;

      const gaps: Gaps = {
        top:
          row > 0
            ? (verticalGaps[col][row - 1]?.direction as VerticalGapDirection)
            : null,
        bottom:
          row < rows - 1
            ? (verticalGaps[col][row]?.direction as VerticalGapDirection)
            : null,
        left:
          col > 0
            ? (horizontalGaps[row][col - 1]
                ?.direction as HorizontalGapDirection)
            : null,
        right:
          col < columns - 1
            ? (horizontalGaps[row][col]?.direction as HorizontalGapDirection)
            : null,
      };

      const piece = new PuzzlePiece(
        spacingX * (col + 1) - 50,
        spacingY * (row + 1) - 50,
        100,
        100,
        number,
        image,
        startX + col * pieceWidth,
        startY + row * pieceHeight,
        pieceWidth,
        pieceHeight,
        gaps,
      );

      if (randomizePositions) {
        piece.x = Math.random() * (canvasWidth - piece.width);
        piece.y = Math.random() * (canvasHeight - piece.height);
      } else {
        piece.x = spacingX * (col + 1) - 50;
        piece.y = spacingY * (row + 1) - 50;
      }

      initialPieces.push(piece);
    }
  }

  const lefts = initialPieces
    .filter((piece) => (piece.number - 1) % columns === 0)
    .map((piece) => piece.number);

  const rights = initialPieces
    .filter((piece) => piece.number % columns === 0)
    .map((piece) => piece.number);

  setLeftSidePieces(lefts);
  setRightSidePieces(rights);

  initialPieces.forEach((piece) => {
    piece.group = null;
  });

  setPieces(initialPieces);
  piecesRef.current = initialPieces;
}
