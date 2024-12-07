"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePuzzleLogic } from "./usePuzzleLogic";
import { InputFile } from "@/components/common/InputFile";
import { Switch } from "../ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

export default function PuzzleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const {
    pieces,
    dragging,
    puzzleComplete,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetPuzzle,
    shufflePuzzle,
  } = usePuzzleLogic(image);
  const [debug, setDebug] = useState(false);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    offscreenCanvas.current = document.createElement("canvas");
  }, []);

  const offscreenCtx = useRef<CanvasRenderingContext2D | null>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = URL.createObjectURL(e.target.files[0]);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * ratio;
    canvas.height = CANVAS_HEIGHT * ratio;
    ctx.scale(ratio, ratio);
  }, []);

  useEffect(() => {
    if (offscreenCanvas.current) {
      offscreenCtx.current = offscreenCanvas.current.getContext("2d");
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sortedPieces = [...pieces].sort((a, b) => a.zIndex - b.zIndex);
    sortedPieces.forEach((piece) => piece.draw(ctx, debug, puzzleComplete));
  }, [pieces, debug, puzzleComplete]);

  useEffect(() => {
    if (dragging) {
      function animate() {
        draw();
        animationFrameIdRef.current = requestAnimationFrame(animate);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      draw();
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [dragging, pieces, draw]);

  useEffect(() => {
    draw();
  }, [debug, draw]);

  return (
    <div>
      <div className="flex items-center space-x-4">
        <InputFile onChange={handleImageUpload} />
        <div className="flex items-center space-x-2">
          <Switch id="debug-mode" checked={debug} onCheckedChange={setDebug} />
          <Label htmlFor="debug-mode">调试模式</Label>
        </div>
        <Button onClick={resetPuzzle}>重置</Button>
        <Button onClick={shufflePuzzle}>打乱</Button>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
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
