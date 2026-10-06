"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { GLYPH_CANVAS_SIZE } from "@/features/font-builder/constants";
import type { GlyphZone } from "@/features/font-builder/glyph-metrics";
import type { Point, Stroke } from "@/features/font-builder/types";

type GlyphCanvasProps = {
  character: string;
  strokes: readonly Stroke[];
  zone: GlyphZone;
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

export const GlyphCanvas = ({ character, strokes, zone, onChange }: GlyphCanvasProps) => {
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
    const zoneBackground = readThemeColor("--muted", "#f1f5f9");
    const guideColor = readThemeColor("--border", "#d4d4d4");
    const labelColor = readThemeColor("--muted-foreground", "#a3a3a3");
    const strokeColor = readThemeColor("--foreground", "#171717");

    context.fillStyle = canvasBackground;
    context.fillRect(0, 0, GLYPH_CANVAS_SIZE, GLYPH_CANVAS_SIZE);

    context.fillStyle = zoneBackground;
    context.fillRect(
      0,
      zone.top * GLYPH_CANVAS_SIZE,
      GLYPH_CANVAS_SIZE,
      (zone.bottom - zone.top) * GLYPH_CANVAS_SIZE,
    );
    context.strokeStyle = guideColor;
    context.lineWidth = 2;
    context.setLineDash([8, 10]);
    [0.2, 0.3, 0.38, 0.8, 0.95].forEach((position) => {
      context.beginPath();
      context.moveTo(0, position * GLYPH_CANVAS_SIZE);
      context.lineTo(GLYPH_CANVAS_SIZE, position * GLYPH_CANVAS_SIZE);
      context.stroke();
    });
    context.setLineDash([]);

    context.fillStyle = labelColor;
    context.font = "600 30px Arial";
    context.fillText(character, 24, 44);

    context.strokeStyle = strokeColor;
    context.lineWidth = 46;
    context.lineCap = "round";
    context.lineJoin = "round";
    strokes.forEach((stroke) => drawStroke(context, stroke.points));
    drawStroke(context, draft);
  }, [character, draft, strokes, themeRevision, zone]);

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
