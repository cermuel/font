import ClipperLib, { type Paths } from "clipper-lib";
import { Font, Glyph, Path } from "opentype.js";
import { FONT_METRICS } from "./constants";
import { createPointTransform, getGlyphZone, getStrokeBounds } from "./glyph-metrics";
import type { GlyphDraft } from "./types";

const EM_SIZE = 1000;
const STROKE_RADIUS = 32;
const SIDE_BEARING = 72;
const MINIMUM_WIDTH = 180;
const CAP_STEPS = 7;
const CLIPPER_STRICTLY_SIMPLE = 2;

type FontPoint = readonly [number, number];

const addPolygon = (path: Path, points: readonly FontPoint[]) => {
  path.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => path.lineTo(x, y));
  path.close();
};

const createCircle = (x: number, y: number) => {
  const points = Array.from({ length: 14 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 14;
    return [
      x + STROKE_RADIUS * Math.cos(angle),
      y + STROKE_RADIUS * Math.sin(angle),
    ] as FontPoint;
  });
  return points;
};

const getUnitNormal = (start: FontPoint, end: FontPoint): FontPoint => {
  const deltaX = end[0] - start[0];
  const deltaY = end[1] - start[1];
  const length = Math.hypot(deltaX, deltaY) || 1;
  return [-deltaY / length, deltaX / length];
};

const createCap = (
  center: FontPoint,
  startDirection: FontPoint,
) => Array.from({ length: CAP_STEPS }, (_, index) => {
  const progress = index / (CAP_STEPS - 1);
  const angle = Math.atan2(startDirection[1], startDirection[0]) -
    Math.PI * progress;
  return [
    center[0] + Math.cos(angle) * STROKE_RADIUS,
    center[1] + Math.sin(angle) * STROKE_RADIUS,
  ] as FontPoint;
});

const createStrokeOutline = (sourcePoints: readonly FontPoint[]) => {
  const points = sourcePoints.filter((point, index) => {
    const previous = sourcePoints[index - 1];
    return !previous || Math.hypot(point[0] - previous[0], point[1] - previous[1]) >= 1;
  });
  if (points.length === 1) return createCircle(points[0][0], points[0][1]);

  const normals = points.map((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    return getUnitNormal(previous, next);
  });
  const left = points.map(([x, y], index) => [
    x + normals[index][0] * STROKE_RADIUS,
    y + normals[index][1] * STROKE_RADIUS,
  ] as FontPoint);
  const right = points.map(([x, y], index) => [
    x - normals[index][0] * STROKE_RADIUS,
    y - normals[index][1] * STROKE_RADIUS,
  ] as FontPoint);
  const endCap = createCap(points.at(-1)!, normals.at(-1)!);
  const startNormal = normals[0];
  const startCap = createCap(points[0], [-startNormal[0], -startNormal[1]]);
  return [...left, ...endCap.slice(1), ...right.toReversed().slice(1), ...startCap.slice(1)];
};

const mergeStrokeOutlines = (outlines: readonly (readonly FontPoint[])[]) => {
  const subject: Paths = outlines.map((outline) => outline.map(([x, y]) => ({
    X: Math.round(x),
    Y: Math.round(y),
  })));
  const solution: Paths = [];
  const clipper = new ClipperLib.Clipper(CLIPPER_STRICTLY_SIMPLE);
  clipper.AddPaths(subject, ClipperLib.PolyType.ptSubject, true);
  clipper.Execute(
    ClipperLib.ClipType.ctUnion,
    solution,
    ClipperLib.PolyFillType.pftNonZero,
    ClipperLib.PolyFillType.pftNonZero,
  );
  return solution.map((outline) => outline.map(({ X, Y }) => [X, Y] as FontPoint));
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

  const outlines = transformedStrokes.map((stroke) => {
    const points = stroke.points.map((point) => [
      point.x * EM_SIZE + offset,
      (FONT_METRICS.baseline - point.y) * EM_SIZE,
    ] as FontPoint);
    return createStrokeOutline(points);
  });
  const mergedOutlines = mergeStrokeOutlines(outlines);
  mergedOutlines.forEach((outline) => addPolygon(path, outline));

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
