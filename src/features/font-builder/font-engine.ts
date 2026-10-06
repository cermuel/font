import { Font, Glyph, Path } from "opentype.js";
import { FONT_METRICS } from "./constants";
import { createPointTransform, getGlyphZone, getStrokeBounds } from "./glyph-metrics";
import type { GlyphDraft } from "./types";

const EM_SIZE = 1000;
const STROKE_RADIUS = 32;
const SIDE_BEARING = 72;
const MINIMUM_WIDTH = 180;

const addPolygon = (path: Path, points: readonly [number, number][]) => {
  path.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => path.lineTo(x, y));
  path.close();
};

const addCircle = (path: Path, x: number, y: number) => {
  const points = Array.from({ length: 14 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 14;
    return [
      x + STROKE_RADIUS * Math.cos(angle),
      y + STROKE_RADIUS * Math.sin(angle),
    ] as [number, number];
  });
  addPolygon(path, points);
};

const createGlyphPath = (glyph: GlyphDraft) => {
  const path = new Path();
  const zone = getGlyphZone(glyph.character, glyph.strokes);
  const { transform } = createPointTransform(glyph.strokes, zone);
  const transformedStrokes = glyph.strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map(transform),
  }));
  const bounds = getStrokeBounds(transformedStrokes);
  if (!bounds) return { path, advanceWidth: MINIMUM_WIDTH + SIDE_BEARING * 2 };
  const drawnWidth = bounds.width * EM_SIZE;
  const contentWidth = Math.max(drawnWidth, MINIMUM_WIDTH);
  const offset = SIDE_BEARING + (contentWidth - drawnWidth) / 2 - bounds.minX * EM_SIZE;

  transformedStrokes.forEach((stroke) => {
    const points = stroke.points.map((point) => [
      point.x * EM_SIZE + offset,
      (FONT_METRICS.baseline - point.y) * EM_SIZE,
    ] as [number, number]);

    points.forEach(([x, y]) => addCircle(path, x, y));
    points.slice(1).forEach(([x, y], index) => {
      const [previousX, previousY] = points[index];
      const distance = Math.hypot(x - previousX, y - previousY);
      if (!distance) return;
      const normalX = ((y - previousY) / distance) * STROKE_RADIUS;
      const normalY = (-(x - previousX) / distance) * STROKE_RADIUS;
      addPolygon(path, [
        [previousX + normalX, previousY + normalY],
        [x + normalX, y + normalY],
        [x - normalX, y - normalY],
        [previousX - normalX, previousY - normalY],
      ]);
    });
  });

  return { path, advanceWidth: Math.round(contentWidth + SIDE_BEARING * 2) };
};

export const buildFontBuffer = (glyphs: Readonly<Record<string, GlyphDraft>>) => {
  const entries = Object.values(glyphs).filter((glyph) => glyph.strokes.length);
  if (!entries.length) return null;

  const fontGlyphs = [
    new Glyph({ name: ".notdef", unicode: 0, advanceWidth: 600 }),
    new Glyph({ name: "space", unicode: 32, advanceWidth: 300 }),
    ...entries.map((glyph) => {
      const { path, advanceWidth } = createGlyphPath(glyph);
      const unicode = glyph.character.codePointAt(0) ?? 0;
      return new Glyph({
        name: `uni${unicode.toString(16).toUpperCase()}`,
        unicode,
        advanceWidth,
        path,
      });
    }),
  ];

  const font = new Font({
    familyName: "My Hand Font",
    styleName: "Regular",
    unitsPerEm: EM_SIZE,
    ascender: 800,
    descender: -200,
    glyphs: fontGlyphs,
  });

  return font.toArrayBuffer();
};
