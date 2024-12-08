import {
  Gap,
  Gaps,
  HorizontalGapDirection,
  VerticalGapDirection,
} from "./types";
import { PuzzlePiece } from "./PuzzlePiece";
import React from "react";
import { getCanvasDimensions } from "./constants";

/**
 * 计算裁剪图像的宽度和高度以适应网格比例。
 *
 * @param image - 要裁剪的HTML图像元素。
 * @param rows - 网格的行数。
 * @param columns - 网格的列数。
 * @returns 包含裁剪宽度和高度的对象。
 */
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

/**
 * 创建一个拼图块实例。
 *
 * @param row - 拼图块所在的行索引。
 * @param col - 拼图块所在的列索引。
 * @param columns - 拼图的总列数。
 * @param rows - 拼图的总行数。
 * @param image - 用于拼图的图像元素。
 * @param startX - 裁剪图像的起始X坐标。
 * @param startY - 裁剪图像的起始Y坐标。
 * @param pieceWidth - 拼图块的宽度。
 * @param pieceHeight - 拼图块的高度。
 * @param horizontalGaps - 水平间隙数组。
 * @param verticalGaps - 垂直间隙数组。
 * @returns 新创建的PuzzlePiece实例。
 */
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

/**
 * 初始化拼图块并设置其初始位置。
 *
 * @param randomizePositions - 是否随机化拼图块的位置。
 * @param image - 用于拼图的图像元素，若为null则不进行初始化。
 * @param horizontalGaps - 水平间隙数组。
 * @param verticalGaps - 垂直间隙数组。
 * @param rows - 拼图的总行数。
 * @param columns - 拼图的总列数。
 * @param setLeftSidePieces - 设置左侧拼图块编号的状态更新函数。
 * @param setRightSidePieces - 设置右侧拼图块编号的状态更新函数。
 * @param setPieces - 设置拼图块数组的状态更新函数。
 * @param piecesRef - 存储拼图块数组的引用。
 */
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

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  const initialPieces: PuzzlePiece[] = [];
  const spacingX = canvasWidth / (columns + 1);
  const spacingY = canvasHeight / (rows + 1);

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
    piece.group = [piece];
  });

  setPieces(initialPieces);
  piecesRef.current = initialPieces;
}
