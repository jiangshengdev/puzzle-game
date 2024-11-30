"use client";

import React, { useEffect, useRef } from "react";
import { usePuzzleGameLogic } from "./usePuzzleGameLogic";

export default function PuzzleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pieces, handleMouseDown, handleMouseMove, handleMouseUp } =
    usePuzzleGameLogic();

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

    function draw() {
      if (ctx) {
        if (canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        pieces.forEach((piece) => piece.draw(ctx));
      }
      requestAnimationFrame(draw);
    }

    draw();
  }, [pieces]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "800px", height: "600px", userSelect: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
