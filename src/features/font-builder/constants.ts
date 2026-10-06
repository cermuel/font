export const CHARACTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

export const DEFAULT_WRITING = "Make every letter yours.";

export const GLYPH_CANVAS_SIZE = 720;

export const FONT_METRICS = {
  baseline: 0.8,
  capTop: 0.2,
  xHeightTop: 0.38,
  tTop: 0.3,
  descenderBottom: 0.95,
} as const;

export const USER_FONT_FAMILY = "UserFont";
export const FALLBACK_FONT_FAMILY = "FallbackFace";
export const FALLBACK_FONT_STACK = `"${FALLBACK_FONT_FAMILY}", sans-serif`;

export const EDITOR_FONT_SIZES = [12, 16, 24, 28, 32, 36, 42, 48, 56] as const;
