import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Gap,
  HorizontalGapDirection,
  PuzzlePiece,
  VerticalGapDirection,
} from "./PuzzlePiece";
import { SNAP_DISTANCE } from "../common/utils";
import { initializePieces } from "./puzzleSetup";

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

  const horizontalGaps: Gap[][] = useMemo(
    () =>
      Array.from({ length: rows }, () =>
        Array.from({ length: columns - 1 }, () => ({
          direction: "leftConvex" as HorizontalGapDirection,
        })),
      ),
    [rows, columns],
  );

  const verticalGaps: Gap[][] = useMemo(
    () =>
      Array.from({ length: columns }, () =>
        Array.from({ length: rows - 1 }, () => ({
          direction: "topConvex" as VerticalGapDirection,
        })),
      ),
    [rows, columns],
  );

  const initialize = useCallback(
    (randomizePositions: boolean) => {
      initializePieces(
        randomizePositions,
        image,
        horizontalGaps,
        verticalGaps,
        rows,
        columns,
        setLeftSidePieces,
        setRightSidePieces,
        setPieces,
        piecesRef,
      );
    },
    [image, horizontalGaps, verticalGaps],
  );

  useEffect(() => {
    initialize(false);
  }, [image, initialize]);

  function resetPuzzle() {
    initialize(false);
  }

  function shufflePuzzle() {
    initialize(true);
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
      selectedPiece.checkSnapping(
        piecesRef.current,
        columns,
        SNAP_DISTANCE,
        leftSidePieces,
        rightSidePieces,
      );

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
