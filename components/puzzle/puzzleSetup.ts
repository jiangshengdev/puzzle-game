import {
  Gap,
  Gaps,
  HorizontalGapDirection,
  VerticalGapDirection,
} from "./types";
import { PuzzlePiece } from "./PuzzlePiece";
import React from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

function calculateCropDimensions(
  image: HTMLImageElement,
  rows: number,
  columns: number,
): { cropWidth: number; cropHeight: number } {
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

  return { cropWidth, cropHeight };
}

function createPuzzlePiece(
  row: number,
  col: number,
  columns: number,
  rows: number,
  image: HTMLImageElement,
  startX: number,
  startY: number,
  pieceWidth: number,
  pieceHeight: number,
  horizontalGaps: Gap[][],
  verticalGaps: Gap[][],
): PuzzlePiece {
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
        ? (horizontalGaps[row][col - 1]?.direction as HorizontalGapDirection)
        : null,
    right:
      col < columns - 1
        ? (horizontalGaps[row][col]?.direction as HorizontalGapDirection)
        : null,
  };

  return new PuzzlePiece(
    0,
    0,
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
}

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
  const spacingX = CANVAS_WIDTH / (columns + 1);
  const spacingY = CANVAS_HEIGHT / (rows + 1);

  const centerX = image.width / 2;
  const centerY = image.height / 2;

  const { cropWidth, cropHeight } = calculateCropDimensions(
    image,
    rows,
    columns,
  );

  const startX = centerX - cropWidth / 2;
  const startY = centerY - cropHeight / 2;

  const pieceWidth = cropWidth / columns;
  const pieceHeight = cropHeight / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const piece = createPuzzlePiece(
        row,
        col,
        columns,
        rows,
        image,
        startX,
        startY,
        pieceWidth,
        pieceHeight,
        horizontalGaps,
        verticalGaps,
      );

      if (randomizePositions) {
        piece.x = Math.random() * (CANVAS_WIDTH - piece.width);
        piece.y = Math.random() * (CANVAS_HEIGHT - piece.height);
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
