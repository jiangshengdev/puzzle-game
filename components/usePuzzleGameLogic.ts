import { useEffect, useRef, useState } from "react";
import { PuzzlePiece } from "./PuzzlePiece";
import {
  adjustGroupPosition,
  alignHorizontally,
  alignVertically,
  areAlignedHorizontally,
  areAlignedVertically,
  mergeGroups,
  SNAP_DISTANCE,
} from "./utils";

export function usePuzzleGameLogic(image: HTMLImageElement | null) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [leftSidePieces, setLeftSidePieces] = useState<number[]>([]);
  const [rightSidePieces, setRightSidePieces] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const piecesRef = useRef<PuzzlePiece[]>([]);

  const rows = 4;
  const columns = 6;

  // 新增：初始化水平缝隙数组
  const horizontalGaps: { direction: "leftConvex" | "rightConvex" }[][] =
    Array.from({ length: rows }, () =>
      Array.from({ length: columns - 1 }, () => ({
        direction: "leftConvex",
      })),
    );

  // 新增：初始化垂直缝隙数组
  const verticalGaps: { direction: "topConvex" | "bottomConvex" }[][] =
    Array.from({ length: columns }, () =>
      Array.from({ length: rows - 1 }, () => ({
        direction: "topConvex",
      })),
    );

  useEffect(() => {
    if (!image) return; // 等待图片加载

    const initialPieces: PuzzlePiece[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    const spacingX = canvasWidth / (columns + 1);
    const spacingY = canvasHeight / (rows + 1);

    // 计算图片中心部分的起始坐标和尺寸
    const centerX = image.width / 2;
    const centerY = image.height / 2;

    // 根据行数和列数的比例截取图片
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

        const gaps = {
          top: row > 0 ? verticalGaps[col][row - 1]?.direction || null : null, // 调整索引
          bottom:
            row < rows - 1 ? verticalGaps[col][row]?.direction || null : null, // 调整索引
          left:
            col > 0 ? horizontalGaps[row][col - 1]?.direction || null : null, // 调整索引
          right:
            col < columns - 1
              ? horizontalGaps[row][col]?.direction || null
              : null, // 调整索引
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
          gaps, // 新增
        );
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
    setPieces(initialPieces);
    piecesRef.current = initialPieces; // 同步到 ref
  }, [image]);

  function checkSnapping(movedPiece: PuzzlePiece) {
    const piecesToCheck = movedPiece.group ? movedPiece.group : [movedPiece];

    piecesToCheck.forEach((piece) => {
      const adjacentNumbers = [
        piece.number - 1, // 左边的拼图块
        piece.number + 1, // 右边的拼图块
        piece.number - columns, // 上面的拼图块
        piece.number + columns, // 下面的拼图块
      ];

      const adjacentPieces = piecesRef.current.filter((otherPiece) =>
        adjacentNumbers.includes(otherPiece.number),
      );

      adjacentPieces.forEach((otherPiece) => {
        if (otherPiece === piece) return;

        const numberDifference = Math.abs(piece.number - otherPiece.number);

        if (
          Math.abs(piece.y - (otherPiece.y + otherPiece.height)) <
            SNAP_DISTANCE &&
          Math.abs(piece.x - otherPiece.x) < SNAP_DISTANCE &&
          numberDifference === columns
        ) {
          if (areAlignedHorizontally(piece, otherPiece)) {
            const offsetY = otherPiece.y + otherPiece.height;
            if (piece.group) {
              adjustGroupPosition(piece.group, 0, offsetY - piece.y);
            } else {
              piece.y = offsetY;
            }
            alignHorizontally(piece, otherPiece);
            mergeGroups(piece, otherPiece);
          }
        }

        if (
          Math.abs(piece.y + piece.height - otherPiece.y) < SNAP_DISTANCE &&
          Math.abs(piece.x - otherPiece.x) < SNAP_DISTANCE &&
          numberDifference === columns
        ) {
          if (areAlignedHorizontally(piece, otherPiece)) {
            const offsetY = otherPiece.y - piece.height;
            if (piece.group) {
              adjustGroupPosition(piece.group, 0, offsetY - piece.y);
            } else {
              piece.y = offsetY;
            }
            alignHorizontally(piece, otherPiece);
            mergeGroups(piece, otherPiece);
          }
        }

        if (
          Math.abs(piece.x - (otherPiece.x + otherPiece.width)) <
            SNAP_DISTANCE &&
          Math.abs(piece.y - otherPiece.y) < SNAP_DISTANCE &&
          piece.number === otherPiece.number + 1 &&
          !(
            (rightSidePieces.includes(otherPiece.number) &&
              leftSidePieces.includes(piece.number)) ||
            (rightSidePieces.includes(piece.number) &&
              leftSidePieces.includes(otherPiece.number))
          )
        ) {
          if (areAlignedVertically(piece, otherPiece)) {
            const offsetX = otherPiece.x + otherPiece.width;
            if (piece.group) {
              adjustGroupPosition(piece.group, offsetX - piece.x, 0);
            } else {
              piece.x = offsetX;
            }
            alignVertically(piece, otherPiece);
            mergeGroups(piece, otherPiece);
          }
        }

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
          if (areAlignedVertically(piece, otherPiece)) {
            const offsetX = otherPiece.x - piece.width;
            if (piece.group) {
              adjustGroupPosition(piece.group, offsetX - piece.x, 0);
            } else {
              piece.x = offsetX;
            }
            alignVertically(piece, otherPiece);
            mergeGroups(piece, otherPiece);
          }
        }
      });
    });
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = pieces.length - 1; i >= 0; i--) {
      if (pieces[i].isPointInside(mouseX, mouseY)) {
        setSelectedPiece(pieces[i]);
        setDragOffset({ x: mouseX - pieces[i].x, y: mouseY - pieces[i].y });
        setDragging(true);

        // 将选中拼图移动到数组末尾并重新分配 zIndex
        const newPieces = [...pieces];
        const selected = newPieces.splice(i, 1)[0];
        newPieces.push(selected);

        newPieces.forEach((piece, index) => {
          if (piece.group) {
            piece.group.forEach((p) => (p.zIndex = index + 1));
          } else {
            piece.zIndex = index + 1;
          }
        });

        piecesRef.current = newPieces; // 同步到 ref
        setPieces(newPieces);
        setDragging(true); // 开始拖动
        break;
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (dragging && selectedPiece) {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;

      const dx = newX - selectedPiece.x;
      const dy = newY - selectedPiece.y;

      if (selectedPiece.group) {
        selectedPiece.group.forEach((piece) => {
          piece.x += dx;
          piece.y += dy;
        });
      } else {
        selectedPiece.x += dx;
        selectedPiece.y += dy;
      }

      // 不再调用 setPieces([...pieces]);
      // piecesRef.current 已经更新了位置
    }
  }

  function handleMouseUp() {
    if (dragging && selectedPiece) {
      checkSnapping(selectedPiece);

      if (selectedPiece.group) {
        selectedPiece.group.forEach((piece) => {
          piece.alignTo(Math.round(piece.x), Math.round(piece.y));
        });
      } else {
        selectedPiece.alignTo(
          Math.round(selectedPiece.x),
          Math.round(selectedPiece.y),
        );
      }
      setPieces([...piecesRef.current]); // 在拖动结束时更新状态
    }
    setDragging(false);
    setSelectedPiece(null);
    setDragging(false); // 结束拖动
  }

  return {
    pieces,
    leftSidePieces,
    rightSidePieces,
    dragging,
    selectedPiece,
    dragOffset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
