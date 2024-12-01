"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePuzzleGameLogic } from "./usePuzzleGameLogic";
import { InputFile } from "@/components/ui/InputFile";

export default function PuzzleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0); // 用于存储动画帧的 ID
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { pieces, dragging, handleMouseDown, handleMouseMove, handleMouseUp } =
    usePuzzleGameLogic(image);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = URL.createObjectURL(e.target.files[0]);
    }
  }

  // 初始化画布，只在组件挂载时执行一次
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
  }, []);

  // 绘制函数
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 根据 zIndex 排序拼图块
    const sortedPieces = [...pieces].sort((a, b) => a.zIndex - b.zIndex);
    sortedPieces.forEach((piece) => piece.draw(ctx));
  }

  // 在拼图状态或拖动状态变化时，决定是否启动/停止动画循环
  useEffect(() => {
    if (dragging) {
      // 开始拖动，启动动画循环
      function animate() {
        draw();
        animationFrameIdRef.current = requestAnimationFrame(animate);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
      // 停止拖动，停止动画循环并重绘一次
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      draw();
    }

    // 组件卸载时清除动画帧
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [dragging, pieces]);

  return (
    <div>
      <InputFile onChange={handleImageUpload} />
      <canvas
        ref={canvasRef}
        style={{ width: "800px", height: "600px", userSelect: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
