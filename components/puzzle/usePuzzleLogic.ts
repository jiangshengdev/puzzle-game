import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PuzzlePiece } from "./PuzzlePiece";
import { Gap, HorizontalGapDirection, VerticalGapDirection } from "./types";
import { COLUMNS, ROWS } from "./constants";
import { initializePieces } from "./puzzleSetup";

/**
 * 自定义Hook，管理拼图游戏的逻辑，包括拼图块的初始化、拖拽、对齐和完成检测等。
 *
 * @param image - 用于拼图的图像元素，若为null则不进行初始化。
 * @param canvasSize - 画布的宽度和高度。
 * @returns 包含拼图逻辑相关状态和处理函数的对象。
 */
export function usePuzzleLogic(
  image: HTMLImageElement | null,
  canvasSize: { width: number; height: number },
) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [leftSidePieces, setLeftSidePieces] = useState<number[]>([]);
  const [rightSidePieces, setRightSidePieces] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const piecesRef = useRef<PuzzlePiece[]>([]);
  const [puzzleComplete, setPuzzleComplete] = useState(false);

  const horizontalGaps: Gap[][] = useMemo(
    () =>
      Array.from({ length: ROWS }, () =>
        Array.from({ length: COLUMNS - 1 }, () => ({
          direction: "leftConvex" as HorizontalGapDirection,
        })),
      ),
    [],
  );

  const verticalGaps: Gap[][] = useMemo(
    () =>
      Array.from({ length: COLUMNS }, () =>
        Array.from({ length: ROWS - 1 }, () => ({
          direction: "topConvex" as VerticalGapDirection,
        })),
      ),
    [],
  );

  /**
   * 初始化拼图块。
   *
   * @param randomizePositions - 是否随机化拼图块的位置。
   */
  const initialize = useCallback(
    (randomizePositions: boolean) => {
      initializePieces(
        randomizePositions,
        image,
        horizontalGaps,
        verticalGaps,
        ROWS,
        COLUMNS,
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
    setPuzzleComplete(false);
  }, [image, initialize]);

  /**
   * 重置拼图，将拼图块恢复到初始位置。
   */
  function resetPuzzle() {
    initialize(false);
    setPuzzleComplete(false);
  }

  /**
   * 打乱拼图块的位置。
   */
  function shufflePuzzle() {
    initialize(true);
    setPuzzleComplete(false);
  }

  /**
   * 处理鼠标按下事件，选择并开始拖拽拼图块。
   *
   * @param e - 鼠标事件对象。
   */
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

  /**
   * 处理鼠标移动事件，更新拖拽中的拼图块的位置。
   *
   * @param e - 鼠标事件对象。
   */
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

  /**
   * 处理鼠标抬起事件，完成拖拽并检查拼图是否完成。
   */
  function handleMouseUp() {
    if (dragging && selectedPiece) {
      selectedPiece.checkSnapping(
        piecesRef.current,
        COLUMNS,
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
      checkPuzzleComplete();
    }
    setDragging(false);
    setSelectedPiece(null);
    setDragging(false);
  }

  /**
   * 检查拼图是否已完成，即所有拼图块是否在同一个组中。
   */
  function checkPuzzleComplete() {
    const allPieces = piecesRef.current;
    if (allPieces.length === 0) {
      setPuzzleComplete(false);
      return;
    }
    const group = allPieces[0].group;
    if (!group) {
      setPuzzleComplete(false);
      return;
    }
    const allInSameGroup = allPieces.every((piece) => piece.group === group);
    if (allInSameGroup && group.length === allPieces.length) {
      setPuzzleComplete(true);
    } else {
      setPuzzleComplete(false);
    }
  }

  /**
   * 确保所有拼图组都在画布内部，若超出则随机重新放置。
   */
  const ensureGroupsInside = useCallback(() => {
    setPieces((currentPieces) => {
      const newPieces = currentPieces.map((piece) => {
        if (piece.group) {
          const group = piece.group;
          const isOutside = group.every(
            (p) =>
              p.x + p.width < 0 ||
              p.x > canvasSize.width ||
              p.y + p.height < 0 ||
              p.y > canvasSize.height,
          );
          if (isOutside) {
            const randomX = Math.random() * (canvasSize.width - piece.width);
            const randomY = Math.random() * (canvasSize.height - piece.height);
            group.forEach((p) => {
              p.x = randomX;
              p.y = randomY;
            });
          }
        }
        return piece;
      });
      piecesRef.current = newPieces;
      return newPieces;
    });
  }, [canvasSize.width, canvasSize.height]);

  useEffect(() => {
    ensureGroupsInside();
  }, [canvasSize, ensureGroupsInside]);

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
    puzzleComplete,
    ensureGroupsInside,
  };
}
