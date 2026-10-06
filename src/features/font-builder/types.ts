export type Point = Readonly<{
  x: number;
  y: number;
  pressure?: number;
}>;

export type Stroke = Readonly<{
  id: string;
  points: readonly Point[];
}>;

export type GlyphDraft = Readonly<{
  character: string;
  strokes: readonly Stroke[];
  updatedAt: string;
}>;

export type EditorFontSize = 12 | 16 | 24 | 28 | 32 | 36 | 42 | 48 | 56;

export type EditorSettings = Readonly<{
  color: string;
  fontSize: EditorFontSize;
  letterSpacing: number;
  lineHeight: number;
  wordSpacing: number;
}>;

export type FontProject = Readonly<{
  id: string;
  name: string;
  version: 1;
  glyphs: Readonly<Record<string, GlyphDraft>>;
  editor: EditorSettings;
  writing: string;
  updatedAt: string;
}>;

export type FontBuildStatus =
  | Readonly<{ state: "idle" }>
  | Readonly<{ state: "building" }>
  | Readonly<{ state: "ready"; familyName: string; url: string }>
  | Readonly<{ state: "error"; message: string }>;
