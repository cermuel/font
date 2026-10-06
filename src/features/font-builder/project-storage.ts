import { DEFAULT_WRITING, EDITOR_FONT_SIZES } from "./constants";
import type { EditorFontSize, FontProject } from "./types";

const STORAGE_KEY = "font-builder.project.v1";

export const createProject = (): FontProject => ({
  id: crypto.randomUUID(),
  name: "Untitled font",
  version: 1,
  glyphs: {},
  editor: {
    color: "#29241f",
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 1.2,
    wordSpacing: 0,
  },
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
