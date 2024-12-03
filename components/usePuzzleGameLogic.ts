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

  const horizontalGaps: { direction: "leftConvex" | "rightConvex" }[][] =
    Array.from({ length: rows }, () =>
      Array.from({ length: columns - 1 }, () => ({
        direction: "leftConvex",
      })),
    );

  const verticalGaps: { direction: "topConvex" | "bottomConvex" }[][] =
    Array.from({ length: columns }, () =>
      Array.from({ length: rows - 1 }, () => ({
        direction: "topConvex",
      })),
    );

  const initializePieces = (randomizePositions: boolean) => {
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

        const gaps = {
          top: row > 0 ? verticalGaps[col][row - 1]?.direction || null : null,
          bottom:
            row < rows - 1 ? verticalGaps[col][row]?.direction || null : null,
          left:
            col > 0 ? horizontalGaps[row][col - 1]?.direction || null : null,
          right:
            col < columns - 1
              ? horizontalGaps[row][col]?.direction || null
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
          // 随机位置，范围在画布内
          piece.x = Math.random() * (canvasWidth - piece.width);
          piece.y = Math.random() * (canvasHeight - piece.height);
        } else {
          // 原始位置，含空隙
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
      piece.group = null; // 清除组信息
    });

    setPieces(initialPieces);
    piecesRef.current = initialPieces;
  };

  useEffect(() => {
    initializePieces(false); // 初始加载时不随机
  }, [image]);

  function resetPuzzle() {
    initializePieces(false); // 重置为原始位置
  }

  function shufflePuzzle() {
    initializePieces(true); // 随机打乱位置
  }

  function checkSnapping(movedPiece: PuzzlePiece) {
    const piecesToCheck = movedPiece.group ? movedPiece.group : [movedPiece];

    piecesToCheck.forEach((piece) => {
      const adjacentNumbers = [
        piece.number - 1,
        piece.number + 1,
        piece.number - columns,
        piece.number + columns,
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

        piecesRef.current = newPieces;
        setPieces(newPieces);
        setDragging(true);
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
      setPieces([...piecesRef.current]);
    }
    setDragging(false);
    setSelectedPiece(null);
    setDragging(false);
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
    resetPuzzle,
    shufflePuzzle,
  };
}
