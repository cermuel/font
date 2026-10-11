"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { GLYPH_CANVAS_SIZE } from "@/features/font-builder/constants";
import type { Point, Stroke } from "@/features/font-builder/types";

type GlyphCanvasProps = {
  character: string;
  strokes: readonly Stroke[];
  onChange: (strokes: readonly Stroke[]) => void;
};

const drawStroke = (
  context: CanvasRenderingContext2D,
  points: readonly Point[],
) => {
  if (!points.length) return;
  context.beginPath();
  context.moveTo(points[0].x * GLYPH_CANVAS_SIZE, points[0].y * GLYPH_CANVAS_SIZE);
  points.slice(1).forEach((point) => {
    context.lineTo(point.x * GLYPH_CANVAS_SIZE, point.y * GLYPH_CANVAS_SIZE);
  });
  if (points.length === 1) {
    context.lineTo(points[0].x * GLYPH_CANVAS_SIZE + 0.1, points[0].y * GLYPH_CANVAS_SIZE);
  }
  context.stroke();
};

const readThemeColor = (name: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const drawCharacterGuide = (
  context: CanvasRenderingContext2D,
  character: string,
  color: string,
) => {
  const targetWidth = GLYPH_CANVAS_SIZE * 0.62;
  const targetHeight = GLYPH_CANVAS_SIZE * 0.58;
  const referenceSize = 100;
  context.save();
  context.textBaseline = "alphabetic";
  context.font = `500 ${referenceSize}px Arial, sans-serif`;
  const reference = context.measureText(character);
  const referenceWidth = reference.actualBoundingBoxLeft + reference.actualBoundingBoxRight;
  const referenceHeight =
    reference.actualBoundingBoxAscent + reference.actualBoundingBoxDescent;
  const scale = Math.min(
    targetWidth / Math.max(referenceWidth, 1),
    targetHeight / Math.max(referenceHeight, 1),
  );
  const fontSize = referenceSize * scale;
  context.font = `500 ${fontSize}px Arial, sans-serif`;
  const metrics = context.measureText(character);
  const centerOffset =
    (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2;
  const x = GLYPH_CANVAS_SIZE / 2 - centerOffset;
  const y =
    GLYPH_CANVAS_SIZE / 2 +
    (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;

  context.fillStyle = color;
  context.globalAlpha = 0.16;
  context.fillText(character, x, y);
  context.restore();
};

export const GlyphCanvas = ({ character, strokes, onChange }: GlyphCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draft, setDraft] = useState<readonly Point[]>([]);
  const [themeRevision, setThemeRevision] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeRevision((revision) => revision + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, GLYPH_CANVAS_SIZE, GLYPH_CANVAS_SIZE);
    const canvasBackground = readThemeColor("--card", "#ffffff");
    const labelColor = readThemeColor("--muted-foreground", "#a3a3a3");
    const strokeColor = readThemeColor("--foreground", "#171717");

    context.fillStyle = canvasBackground;
    context.fillRect(0, 0, GLYPH_CANVAS_SIZE, GLYPH_CANVAS_SIZE);
    drawCharacterGuide(context, character, labelColor);

    context.strokeStyle = strokeColor;
    context.lineWidth = 46;
    context.lineCap = "round";
    context.lineJoin = "round";
    strokes.forEach((stroke) => drawStroke(context, stroke.points));
    drawStroke(context, draft);
  }, [character, draft, strokes, themeRevision]);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
      pressure: event.pressure || undefined,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraft([getPoint(event)]);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const point = getPoint(event);
    setDraft((current) => [...current, point]);
  };

  const finishStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!draft.length) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onChange([...strokes, { id: crypto.randomUUID(), points: draft }]);
    setDraft([]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={GLYPH_CANVAS_SIZE}
      height={GLYPH_CANVAS_SIZE}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerCancel={finishStroke}
      aria-label={`Drawing canvas for the character ${character}`}
      className="block aspect-square size-full touch-none rounded-lg bg-card shadow-[inset_0_0_0_1px_oklch(0_0_0/.10)] dark:shadow-[inset_0_0_0_1px_oklch(1_0_0/.10)]"
    />
  );
};
