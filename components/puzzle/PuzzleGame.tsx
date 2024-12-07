"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePuzzleGameLogic } from "./usePuzzleGameLogic";
import { InputFile } from "@/components/puzzle/InputFile";
import { Switch } from "../ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PuzzleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const {
    pieces,
    dragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetPuzzle,
    shufflePuzzle,
  } = usePuzzleGameLogic(image);
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
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
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
    sortedPieces.forEach((piece) => piece.draw(ctx, debug));
  }, [pieces, debug]);

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
        style={{ width: "800px", height: "600px", userSelect: "none" }}
        onMouseDown={(e) => {
          for (let i = pieces.length - 1; i >= 0; i--) {
            if (
              pieces[i].isPointInside(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY,
              )
            ) {
              handleMouseDown(e);
              break;
            }
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
