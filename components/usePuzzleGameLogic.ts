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
    pieces.forEach((piece) => {
      if (piece === movedPiece) return;

      const numberDifference = Math.abs(movedPiece.number - piece.number);

      // 垂直吸附
      if (
        Math.abs(movedPiece.y - (piece.y + piece.height)) < SNAP_DISTANCE &&
        numberDifference === columns
      ) {
        if (areAlignedHorizontally(movedPiece, piece)) {
          const offsetY = piece.y + piece.height;
          if (movedPiece.group) {
            adjustGroupPosition(movedPiece.group, 0, offsetY - movedPiece.y);
          } else {
            movedPiece.y = offsetY;
          }
          alignHorizontally(movedPiece, piece);
          mergeGroups(movedPiece, piece);
        }
      }

      if (
        Math.abs(movedPiece.y + movedPiece.height - piece.y) < SNAP_DISTANCE &&
        numberDifference === columns
      ) {
        if (areAlignedHorizontally(movedPiece, piece)) {
          const offsetY = piece.y - movedPiece.height;
          if (movedPiece.group) {
            adjustGroupPosition(movedPiece.group, 0, offsetY - movedPiece.y);
          } else {
            movedPiece.y = offsetY;
          }
          alignHorizontally(movedPiece, piece);
          mergeGroups(movedPiece, piece);
        }
      }

      // 水平吸附
      if (
        Math.abs(movedPiece.x - (piece.x + piece.width)) < SNAP_DISTANCE &&
        movedPiece.number === piece.number + 1 &&
        !(
          (rightSidePieces.includes(piece.number) &&
            leftSidePieces.includes(movedPiece.number)) ||
          (rightSidePieces.includes(movedPiece.number) &&
            leftSidePieces.includes(piece.number))
        )
      ) {
        if (areAlignedVertically(movedPiece, piece)) {
          const offsetX = piece.x + piece.width;
          if (movedPiece.group) {
            adjustGroupPosition(movedPiece.group, offsetX - movedPiece.x, 0);
          } else {
            movedPiece.x = offsetX;
          }
          alignVertically(movedPiece, piece);
          mergeGroups(movedPiece, piece);
        }
      }

      if (
        Math.abs(movedPiece.x + movedPiece.width - piece.x) < SNAP_DISTANCE &&
        movedPiece.number === piece.number - 1 &&
        !(
          (rightSidePieces.includes(piece.number) &&
            leftSidePieces.includes(movedPiece.number)) ||
          (rightSidePieces.includes(movedPiece.number) &&
            leftSidePieces.includes(piece.number))
        )
      ) {
        if (areAlignedVertically(movedPiece, piece)) {
          const offsetX = piece.x - movedPiece.width;
          if (movedPiece.group) {
            adjustGroupPosition(movedPiece.group, offsetX - movedPiece.x, 0);
          } else {
            movedPiece.x = offsetX;
          }
          alignVertically(movedPiece, piece);
          mergeGroups(movedPiece, piece);
        }
      }
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
