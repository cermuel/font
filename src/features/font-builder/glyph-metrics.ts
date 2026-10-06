import { FONT_METRICS } from "./constants";
import type { Point, Stroke } from "./types";

export type GlyphZone = Readonly<{
  top: number;
  bottom: number;
  hasTail?: boolean;
}>;

type StrokeBounds = Readonly<{
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}>;

const TAIL_CHARACTERS = new Set(["g", "p", "q", "y"]);
const TALL_LOWERCASE = new Set(["b", "d", "f", "h", "i", "k", "l"]);

export const getStrokeBounds = (strokes: readonly Stroke[]): StrokeBounds | null => {
  const points = strokes.flatMap((stroke) => stroke.points);
  if (!points.length) return null;
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const getGlyphZone = (character: string, strokes: readonly Stroke[]): GlyphZone => {
  const { baseline, capTop, xHeightTop, tTop, descenderBottom } = FONT_METRICS;
  if (character === "j") {
    return { top: capTop, bottom: descenderBottom };
  }
  if (TAIL_CHARACTERS.has(character)) {
    const bounds = getStrokeBounds(strokes);
    const ratio = bounds ? bounds.height / Math.max(bounds.width, 0.001) : 0;
    const hasTail = ratio >= 1.35;
    return hasTail
      ? { top: xHeightTop, bottom: descenderBottom, hasTail }
      : { top: xHeightTop, bottom: baseline, hasTail };
  }
  if (character === "t") {
    return { top: tTop, bottom: baseline };
  }
  if (/[A-Z0-9]/.test(character) || TALL_LOWERCASE.has(character)) {
    return { top: capTop, bottom: baseline };
  }
  return { top: xHeightTop, bottom: baseline };
};

export const createPointTransform = (
  strokes: readonly Stroke[],
  zone: GlyphZone,
) => {
  const bounds = getStrokeBounds(strokes);
  const canScale = bounds && bounds.height >= 0.04;
  if (!canScale) {
    return {
      scale: 1,
      transform: (point: Point): Point => point,
    };
  }

  const scale = Math.min((zone.bottom - zone.top) / bounds.height, 6);
  return {
    scale,
    transform: (point: Point): Point => ({
      ...point,
      x: (point.x - bounds.minX) * scale,
      y: zone.bottom - (bounds.maxY - point.y) * scale,
    }),
  };
};
