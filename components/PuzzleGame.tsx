"use client";

import React, { useEffect, useRef, useState } from "react";

// PuzzlePiece class definition
class PuzzlePiece {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  group: PuzzlePiece[] | null;
  number: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    number: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.group = null;
    this.number = number;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "black";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.number.toString(),
      this.x + this.width / 2,
      this.y + this.height / 2,
    );
  }

  isPointInside(px: number, py: number) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  alignTo(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }
}

// Utility functions
const SNAP_DISTANCE = 20;

function adjustGroupPosition(group: PuzzlePiece[], dx: number, dy: number) {
  group.forEach((piece) => {
    piece.x += dx;
    piece.y += dy;
  });
}

function alignHorizontally(movedPiece: PuzzlePiece, targetPiece: PuzzlePiece) {
  const offsetX = targetPiece.x;
  const dx = offsetX - movedPiece.x;
  if (movedPiece.group) {
    adjustGroupPosition(movedPiece.group, dx, 0);
  } else {
    movedPiece.x = offsetX;
  }
}

function alignVertically(movedPiece: PuzzlePiece, targetPiece: PuzzlePiece) {
  const offsetY = targetPiece.y;
  const dy = offsetY - movedPiece.y;
  if (movedPiece.group) {
    adjustGroupPosition(movedPiece.group, 0, dy);
  } else {
    movedPiece.y = offsetY;
  }
}

function areAlignedVertically(pieceA: PuzzlePiece, pieceB: PuzzlePiece) {
  const overlap = getOverlap(
    pieceA.y,
    pieceA.y + pieceA.height,
    pieceB.y,
    pieceB.y + pieceB.height,
  );
  return overlap > 0;
}

function areAlignedHorizontally(pieceA: PuzzlePiece, pieceB: PuzzlePiece) {
  const overlap = getOverlap(
    pieceA.x,
    pieceA.x + pieceA.width,
    pieceB.x,
    pieceB.x + pieceB.width,
  );
  return overlap > 0;
}

function getOverlap(min1: number, max1: number, min2: number, max2: number) {
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
}

function mergeGroups(pieceA: PuzzlePiece, pieceB: PuzzlePiece) {
  if (pieceA.group && pieceB.group) {
    if (pieceA.group !== pieceB.group) {
      pieceB.group.forEach((piece) => {
        piece.group = pieceA.group;
        pieceA.group!.push(piece);
      });
    }
  } else if (pieceA.group) {
    pieceB.group = pieceA.group;
    pieceA.group.push(pieceB);
  } else if (pieceB.group) {
    pieceA.group = pieceB.group;
    pieceB.group.push(pieceA);
  } else {
    const newGroup = [pieceA, pieceB];
    pieceA.group = newGroup;
    pieceB.group = newGroup;
  }
}

export default function PuzzleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [leftSidePieces, setLeftSidePieces] = useState<number[]>([]);
  const [rightSidePieces, setRightSidePieces] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const columns = 4; // 将columns移到组件顶部

  useEffect(() => {
    const initialPieces = [
      new PuzzlePiece(50, 50, 100, 100, "red", 1),
      new PuzzlePiece(200, 50, 100, 100, "green", 2),
      new PuzzlePiece(350, 50, 100, 100, "blue", 3),
      new PuzzlePiece(500, 50, 100, 100, "yellow", 4),
      new PuzzlePiece(50, 200, 100, 100, "purple", 5),
      new PuzzlePiece(200, 200, 100, 100, "orange", 6),
      new PuzzlePiece(350, 200, 100, 100, "pink", 7),
      new PuzzlePiece(500, 200, 100, 100, "cyan", 8),
      new PuzzlePiece(50, 350, 100, 100, "lime", 9),
      new PuzzlePiece(200, 350, 100, 100, "teal", 10),
      new PuzzlePiece(350, 350, 100, 100, "magenta", 11),
      new PuzzlePiece(500, 350, 100, 100, "brown", 12),
    ];

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
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      const canvas = canvasRef.current;
      if (!canvas) return;

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
