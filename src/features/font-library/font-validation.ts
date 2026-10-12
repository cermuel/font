import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { CHARACTERS, EDITOR_FONT_SIZES } from "@/features/font-builder/constants";
import type { EditorFontSize } from "@/features/font-builder/types";

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const allowedCharacters = new Set(CHARACTERS);
const pointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  pressure: z.number().min(0).max(1).optional(),
});
const strokeSchema = z.object({
  id: z.string().min(1).max(100),
  points: z.array(pointSchema).max(5000),
});
const glyphSchema = z.object({
  character: z.string().length(1),
  strokes: z.array(strokeSchema).max(1000),
  updatedAt: z.iso.datetime(),
});
const editorSchema = z.object({
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  fontSize: z.custom<EditorFontSize>((value) => (
    typeof value === "number" && EDITOR_FONT_SIZES.includes(value as EditorFontSize)
  )),
  letterSpacing: z.number().finite().min(-20).max(100),
  lineHeight: z.number().finite().min(0.8).max(3),
  wordSpacing: z.number().finite().min(-20).max(200),
});

export const fontDocumentSchema = z.object({
  version: z.literal(1),
  glyphs: z.record(z.string(), glyphSchema).refine(
    (glyphs) => Object.entries(glyphs).every(([key, glyph]) => (
      allowedCharacters.has(key) && glyph.character === key
    )),
    "The document contains an unsupported glyph.",
  ),
  editor: editorSchema,
  writing: z.string().max(500_000),
}).transform((document) => ({
  ...document,
  writing: sanitizeWriting(document.writing),
})).refine(
  (document) => new TextEncoder().encode(JSON.stringify(document)).byteLength <= MAX_DOCUMENT_BYTES,
  "The font document is larger than 5 MB.",
);

export const fontNameSchema = z.string().trim().min(1).max(80);

export const createFontSchema = z.object({
  id: z.uuid().optional(),
  name: fontNameSchema,
  document: fontDocumentSchema,
});

export const updateFontSchema = z.object({
  expectedRevision: z.number().int().positive(),
  name: fontNameSchema.optional(),
  document: fontDocumentSchema.optional(),
}).refine((value) => value.name !== undefined || value.document !== undefined);

export const sanitizeWriting = (writing: string) => sanitizeHtml(writing, {
  allowedTags: [
    "div", "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
    "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "span",
  ],
  allowedAttributes: { "*": ["style"] },
  allowedStyles: {
    "*": {
      "font-size": [/^(12|16|24|28|32|36|42|48|56)px$/],
      "text-align": [/^(left|right|center|justify)$/],
      "--marker-font-size": [/^(12|16|24|28|32|36|42|48|56)px$/],
    },
  },
});
