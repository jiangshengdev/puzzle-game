"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePuzzleLogic } from "./usePuzzleLogic";
import { InputFile } from "@/components/common/InputFile";
import { Switch } from "../ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getCanvasDimensions } from "./constants";
import { PuzzleDrawer } from "./PuzzleDrawer";

/**
 * 拼图游戏组件，负责渲染画布和控制面板，处理用户交互。
 *
 * @returns 渲染的拼图游戏界面。
 */
export default function PuzzleGame() {
  // 引用画布元素
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 引用动画帧ID，用于取消动画
  const animationFrameIdRef = useRef<number>(0);

  // 状态管理：用户上传的图像
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // 状态管理：画布尺寸
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 600 });

  // 使用自定义Hook管理拼图逻辑
  const {
    pieces,
    dragging,
    puzzleComplete,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetPuzzle,
    shufflePuzzle,
    ensureGroupsInside,
  } = usePuzzleLogic(image, canvasSize);

  // 状态管理：调试模式
  const [debug, setDebug] = useState(false);

  // 引用离屏画布，用于优化绘制
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);

  // 创建离屏画布
  useEffect(() => {
    offscreenCanvas.current = document.createElement("canvas");
  }, []);

  // 引用离屏画布的绘图上下文
  const offscreenCtx = useRef<CanvasRenderingContext2D | null>(null);

  /**
   * 处理图像上传事件，加载用户上传的图像作为拼图素材。
   *
   * @param e - 输入文件的变化事件。
   */
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = URL.createObjectURL(e.target.files[0]);
    }
  }

  // 设置画布尺寸并添加窗口大小调整监听器
  useEffect(() => {
    setCanvasSize(getCanvasDimensions());
    ensureGroupsInside();

    // 处理窗口大小调整
    const updateSize = () => {
      setCanvasSize(getCanvasDimensions());
      ensureGroupsInside();
    };

    window.addEventListener("resize", updateSize);

    // 清理监听器
    return () => window.removeEventListener("resize", updateSize);
  }, [ensureGroupsInside]);

  // 设置画布的实际像素尺寸和缩放比例
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * ratio;
    canvas.height = canvasSize.height * ratio;
    ctx.scale(ratio, ratio);
  }, [canvasSize]);

  // 获取离屏画布的绘图上下文
  useEffect(() => {
    if (offscreenCanvas.current) {
      offscreenCtx.current = offscreenCanvas.current.getContext("2d");
    }
  }, []);

  /**
   * 绘制所有拼图块到画布上。
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清除之前绘制的组
    PuzzleDrawer.drawnGroups.clear();

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 根据zIndex排序拼图块，确保正确的绘制顺序
    const sortedPieces = [...pieces].sort((a, b) => a.zIndex - b.zIndex);

    // 绘制每个拼图块
    sortedPieces.forEach((piece) => piece.draw(ctx, debug, puzzleComplete));
  }, [pieces, debug, puzzleComplete]);

  // 管理拖拽动画帧
  useEffect(() => {
    if (dragging) {
      // 动画循环函数
      function animate() {
        draw();
        animationFrameIdRef.current = requestAnimationFrame(animate);
      }

      // 开始动画
      animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
      // 取消动画帧
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      // 绘制当前状态
      draw();
    }

    // 清理动画帧
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [dragging, pieces, draw]);

  // 当调试模式或绘制函数变化时重新绘制
  useEffect(() => {
    draw();
  }, [debug, draw]);

  return (
    <div style={{ position: "relative" }}>
      <div
        className="floating-ui"
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <div className="flex items-center space-x-4">
          {/* 图像上传组件 */}
          <InputFile onChange={handleImageUpload} />

          <div className="flex items-center space-x-2 whitespace-nowrap">
            {/* 调试模式切换开关 */}
            <Switch
              id="debug-mode"
              checked={debug}
              onCheckedChange={setDebug}
            />
            <Label htmlFor="debug-mode">调试模式</Label>
          </div>

          {/* 重置拼图按钮 */}
          <Button onClick={resetPuzzle}>重置</Button>

          {/* 打乱拼图按钮 */}
          <Button onClick={shufflePuzzle}>打乱</Button>
        </div>
      </div>

      {/* 拼图画布 */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
