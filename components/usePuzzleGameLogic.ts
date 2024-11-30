import { useEffect, useState } from "react";
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

export function usePuzzleGameLogic() {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [leftSidePieces, setLeftSidePieces] = useState<number[]>([]);
  const [rightSidePieces, setRightSidePieces] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const rows = 3;
  const columns = 4;
  const totalPieces = rows * columns;

  useEffect(() => {
    const initialPieces: PuzzlePiece[] = [];
    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const number = row * columns + col + 1;
        initialPieces.push(
          new PuzzlePiece(
            50 + col * 150,
            50 + row * 150,
            100,
            100,
            `hsl(${(360 / totalPieces) * index}, 50%, 50%)`,
            number,
          ),
        );
        index += 1;
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
  }, []);

  function checkSnapping(movedPiece: PuzzlePiece) {
    const piecesToCheck = movedPiece.group ? movedPiece.group : [movedPiece];

    piecesToCheck.forEach((piece) => {
      pieces.forEach((otherPiece) => {
        if (otherPiece === piece) return;

        const numberDifference = Math.abs(piece.number - otherPiece.number);

        // 垂直吸附
        if (
          Math.abs(piece.y - (otherPiece.y + otherPiece.height)) <
            SNAP_DISTANCE &&
          Math.abs(piece.x - otherPiece.x) < SNAP_DISTANCE && // 添加水平距离检查
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
          Math.abs(piece.x - otherPiece.x) < SNAP_DISTANCE && // 添加水平距离检查
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

        // 水平吸附
        if (
          Math.abs(piece.x - (otherPiece.x + otherPiece.width)) <
            SNAP_DISTANCE &&
          Math.abs(piece.y - otherPiece.y) < SNAP_DISTANCE && // 添加垂直距离检查
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
          Math.abs(piece.y - otherPiece.y) < SNAP_DISTANCE && // 添加垂直距离检查
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
        newPieces.push(newPieces.splice(i, 1)[0]);
        setPieces(newPieces);
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

      setPieces([...pieces]);
    }
  }

  function handleMouseUp() {
    if (dragging && selectedPiece) {
      // 执行吸附检测
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
      setPieces([...pieces]);
    }
    setDragging(false);
    setSelectedPiece(null);
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
