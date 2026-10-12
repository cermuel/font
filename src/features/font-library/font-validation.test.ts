import { describe, expect, it } from "vitest";
import { createProject, projectToDocument } from "@/features/font-builder/project-storage";
import { fontDocumentSchema } from "./font-validation";

describe("font document validation", () => {
  it("accepts the default document", () => {
    expect(fontDocumentSchema.safeParse(projectToDocument(createProject())).success).toBe(true);
  });

  it("rejects unsupported glyph keys", () => {
    const document = projectToDocument(createProject());
    const result = fontDocumentSchema.safeParse({
      ...document,
      glyphs: {
        "!": { character: "!", strokes: [], updatedAt: new Date().toISOString() },
      },
    });
    expect(result.success).toBe(false);
  });

  it("removes unsafe writing markup", () => {
    const document = projectToDocument(createProject());
    const result = fontDocumentSchema.parse({
      ...document,
      writing: '<p style="font-size:24px" onclick="alert(1)">Hello<script>alert(1)</script></p>',
    });
    expect(result.writing).toBe('<p style="font-size:24px">Hello</p>');
  });

  it("rejects editor settings outside supported values", () => {
    const document = projectToDocument(createProject());
    expect(fontDocumentSchema.safeParse({
      ...document,
      editor: { ...document.editor, fontSize: 13 },
    }).success).toBe(false);
  });
});
