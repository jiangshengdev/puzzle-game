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
  // 定义拼图块的状态数组
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  // 存储左侧边缘的拼图块编号
  const [leftSidePieces, setLeftSidePieces] = useState<number[]>([]);
  // 存储右侧边缘的拼图块编号
  const [rightSidePieces, setRightSidePieces] = useState<number[]>([]);
  // 标识是否正在拖拽拼图块
  const [dragging, setDragging] = useState(false);
  // 当前被选中的拼图块
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  // 拖拽时的偏移量
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // 引用当前的拼图块数组，用于避免闭包问题
  const piecesRef = useRef<PuzzlePiece[]>([]);
  // 标识拼图是否完成
  const [puzzleComplete, setPuzzleComplete] = useState(false);

  // 定义水平间隙的状态
  const horizontalGaps: Gap[][] = useMemo(
    () =>
      Array.from({ length: ROWS }, () =>
        Array.from({ length: COLUMNS - 1 }, () => ({
          direction: "leftConvex" as HorizontalGapDirection,
        })),
      ),
    [],
  );

  // 定义垂直间隙的状态
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

  // 当图像或初始化函数变化时，初始化拼图并重置完成状态
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

    // 从顶层拼图块开始检查，找到被点击的拼图块
    for (let i = pieces.length - 1; i >= 0; i--) {
      if (pieces[i].isPointInside(mouseX, mouseY)) {
        setSelectedPiece(pieces[i]);
        setDragOffset({ x: mouseX - pieces[i].x, y: mouseY - pieces[i].y });
        setDragging(true);

        // 将选中的拼图块移到数组末尾，提升其zIndex
        const newPieces = [...pieces];
        const selected = newPieces.splice(i, 1)[0];
        newPieces.push(selected);

        // 更新所有拼图块的zIndex
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

      // 计算新的位置
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;

      const dx = newX - selectedPiece.x;
      const dy = newY - selectedPiece.y;

      // 更新选中拼图块及其组的位置
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
      // 检查并处理拼图块的对齐
      selectedPiece.checkSnapping(
        piecesRef.current,
        COLUMNS,
        leftSidePieces,
        rightSidePieces,
      );

      // 对齐拼图块的位置
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
    // 重置拖拽状态
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
    // 检查所有拼图块是否属于同一个组
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
          // 检查整个组是否超出画布边界
          const isOutside = group.every(
            (p) =>
              p.x + p.width < 0 ||
              p.x > canvasSize.width ||
              p.y + p.height < 0 ||
              p.y > canvasSize.height,
          );
          if (isOutside) {
            // 随机生成新的位置
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

  // 当画布大小变化时，确保拼图组在内部
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
