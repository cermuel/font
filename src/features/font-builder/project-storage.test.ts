import { describe, expect, it } from "vitest";
import { DEFAULT_WRITING } from "./constants";
import { createProject, isMeaningfulProject } from "./project-storage";

describe("anonymous project migration", () => {
  it("does not import a untouched default project", () => {
    expect(isMeaningfulProject(createProject())).toBe(false);
  });

  it("imports changed writing", () => {
    expect(isMeaningfulProject({
      ...createProject(),
      writing: `${DEFAULT_WRITING} More text.`,
    })).toBe(true);
  });

  it("imports a project containing strokes", () => {
    const project = createProject();
    expect(isMeaningfulProject({
      ...project,
      glyphs: {
        a: {
          character: "a",
          strokes: [{ id: "stroke-1", points: [{ x: 10, y: 20 }] }],
          updatedAt: new Date().toISOString(),
        },
      },
    })).toBe(true);
  });
});
