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
  // 计算网格的纵横比
  const gridAspectRatio = columns / rows;
  // 计算图像的纵横比
  const imageAspectRatio = image.width / image.height;
  let cropWidth: number;
  let cropHeight: number;

  // 根据图像和网格的纵横比决定裁剪宽度和高度
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
  // 计算拼图块的编号
  const number = row * columns + col + 1;

  // 根据位置获取各边的间隙信息
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

  // 创建并返回新的拼图块实例
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
  // 如果没有图像，则不进行初始化
  if (!image) return;

  // 获取画布的宽度和高度
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  // 初始化拼图块数组
  const initialPieces: PuzzlePiece[] = [];
  // 计算水平和垂直方向的间距
  const spacingX = canvasWidth / (columns + 1);
  const spacingY = canvasHeight / (rows + 1);

  // 计算图像的中心坐标
  const centerX = image.width / 2;
  const centerY = image.height / 2;

  // 计算裁剪后的宽度和高度
  const { cropWidth, cropHeight } = calculateCropDimensions(
    image,
    rows,
    columns,
  );

  // 计算裁剪的起始坐标
  const startX = centerX - cropWidth / 2;
  const startY = centerY - cropHeight / 2;

  // 计算每个拼图块的宽度和高度
  const pieceWidth = cropWidth / columns;
  const pieceHeight = cropHeight / rows;

  // 遍历每一行和每一列创建拼图块
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      // 创建拼图块
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

      // 如果需要随机化位置，则设置随机坐标
      if (randomizePositions) {
        piece.x = Math.random() * (canvasWidth - piece.width);
        piece.y = Math.random() * (canvasHeight - piece.height);
      } else {
        // 否则，按照网格间距设置初始坐标
        piece.x = spacingX * (col + 1) - 50;
        piece.y = spacingY * (row + 1) - 50;
      }

      // 将拼图块添加到初始数组中
      initialPieces.push(piece);
    }
  }

  // 获取左侧边缘的拼图块编号
  const lefts = initialPieces
    .filter((piece) => (piece.number - 1) % columns === 0)
    .map((piece) => piece.number);

  // 获取右侧边缘的拼图块编号
  const rights = initialPieces
    .filter((piece) => piece.number % columns === 0)
    .map((piece) => piece.number);

  // 更新左侧边缘拼图块的状态
  setLeftSidePieces(lefts);
  // 更新右侧边缘拼图块的状态
  setRightSidePieces(rights);

  // 为每个拼图块设置其所属的组
  initialPieces.forEach((piece) => {
    piece.group = [piece];
  });

  // 更新拼图块数组的状态
  setPieces(initialPieces);
  // 更新引用中的拼图块数组
  piecesRef.current = initialPieces;
}
