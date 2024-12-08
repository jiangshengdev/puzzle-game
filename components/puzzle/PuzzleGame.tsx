"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePuzzleLogic } from "./usePuzzleLogic";
import { InputFile } from "@/components/common/InputFile";
import { Switch } from "../ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getCanvasDimensions } from "./constants";
import { PuzzleDrawer } from "./PuzzleDrawer";

export default function PuzzleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 600 });

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
    setCanvasSize(getCanvasDimensions());
    ensureGroupsInside();
    const updateSize = () => {
      setCanvasSize(getCanvasDimensions());
      ensureGroupsInside();
    };
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [ensureGroupsInside]);

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

    PuzzleDrawer.drawnGroups.clear();

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
          <InputFile onChange={handleImageUpload} />
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <Switch
              id="debug-mode"
              checked={debug}
              onCheckedChange={setDebug}
            />
            <Label htmlFor="debug-mode">调试模式</Label>
          </div>
          <Button onClick={resetPuzzle}>重置</Button>
          <Button onClick={shufflePuzzle}>打乱</Button>
        </div>
      </div>
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
