import { DEFAULT_WRITING, EDITOR_FONT_SIZES } from "./constants";
import type { EditorFontSize, FontDocument, FontProject, FontRecord } from "./types";

const STORAGE_KEY = "font-builder.project.v1";

export const DEFAULT_EDITOR = {
  color: "#29241f",
  fontSize: 24,
  letterSpacing: 0,
  lineHeight: 1.2,
  wordSpacing: 0,
} as const;

export const createProject = (): FontProject => ({
  id: crypto.randomUUID(),
  name: "Untitled font",
  version: 1,
  glyphs: {},
  editor: DEFAULT_EDITOR,
  writing: DEFAULT_WRITING,
  updatedAt: new Date().toISOString(),
});

export const loadProject = () => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return createProject();

  try {
    const project = JSON.parse(stored) as FontProject;
    if (project.version !== 1) return createProject();

    const fontSize = EDITOR_FONT_SIZES.includes(project.editor.fontSize as EditorFontSize)
      ? project.editor.fontSize
      : 24;

    return {
      ...project,
      editor: { ...project.editor, fontSize },
    };
  } catch {
    return createProject();
  }
};

export const saveProject = (project: FontProject) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
};

export const clearProject = () => window.localStorage.removeItem(STORAGE_KEY);

export const isMeaningfulProject = (project: FontProject) => (
  project.name !== "Untitled font" ||
  Object.values(project.glyphs).some((glyph) => glyph.strokes.length > 0) ||
  project.writing !== DEFAULT_WRITING ||
  JSON.stringify(project.editor) !== JSON.stringify(DEFAULT_EDITOR)
);

export const recoveryKey = (userId: string, fontId: string) =>
  `font-builder.recovery.${userId}.${fontId}.v1`;

export const projectToDocument = (project: FontProject): FontDocument => ({
  version: project.version,
  glyphs: project.glyphs,
  editor: project.editor,
  writing: project.writing,
});

export const recordToProject = (font: FontRecord): FontProject => ({
  id: font.id,
  name: font.name,
  ...font.document,
  updatedAt: font.updatedAt,
});
