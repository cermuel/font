import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { fonts } from "@/db/schema";
import type { FontDocument, FontRecord, FontSummary } from "@/features/font-builder/types";

type FontRow = typeof fonts.$inferSelect;

const toRecord = (row: FontRow): FontRecord => ({
  id: row.id,
  name: row.name,
  document: {
    version: 1,
    glyphs: row.glyphs,
    editor: row.editorSettings,
    writing: row.writing,
  },
  revision: row.revision,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const listFonts = async (ownerId: string): Promise<FontSummary[]> => {
  const rows = await db.select().from(fonts)
    .where(eq(fonts.ownerId, ownerId)).orderBy(desc(fonts.updatedAt));
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    completedGlyphs: Object.values(row.glyphs).filter((glyph) => glyph.strokes.length).length,
    revision: row.revision,
    updatedAt: row.updatedAt.toISOString(),
  }));
};

export const getFont = async (ownerId: string, id: string) => {
  const [row] = await db.select().from(fonts)
    .where(and(eq(fonts.id, id), eq(fonts.ownerId, ownerId))).limit(1);
  return row ? toRecord(row) : null;
};

export const createFont = async (
  ownerId: string,
  input: { id?: string; name: string; document: FontDocument },
) => {
  let id = input.id ?? crypto.randomUUID();
  const [collision] = await db.select({ id: fonts.id }).from(fonts)
    .where(eq(fonts.id, id)).limit(1);
  if (collision) id = crypto.randomUUID();
  const [row] = await db.insert(fonts).values({
    id,
    ownerId,
    name: input.name,
    schemaVersion: input.document.version,
    glyphs: input.document.glyphs,
    editorSettings: input.document.editor,
    writing: input.document.writing,
  }).returning();
  return toRecord(row);
};

export const updateFont = async (
  ownerId: string,
  id: string,
  input: { expectedRevision: number; name?: string; document?: FontDocument },
) => {
  const changes = input.document ? {
    schemaVersion: input.document.version,
    glyphs: input.document.glyphs,
    editorSettings: input.document.editor,
    writing: input.document.writing,
  } : {};
  const [row] = await db.update(fonts).set({
    ...changes,
    ...(input.name ? { name: input.name } : {}),
    revision: sql`${fonts.revision} + 1`,
    updatedAt: new Date(),
  }).where(and(
    eq(fonts.id, id),
    eq(fonts.ownerId, ownerId),
    eq(fonts.revision, input.expectedRevision),
  )).returning();
  if (row) return { state: "saved" as const, font: toRecord(row) };
  const current = await getFont(ownerId, id);
  return current
    ? { state: "conflict" as const, font: current }
    : { state: "missing" as const };
};

export const deleteFont = async (ownerId: string, id: string) => {
  const [row] = await db.delete(fonts).where(and(
    eq(fonts.id, id), eq(fonts.ownerId, ownerId),
  )).returning({ id: fonts.id });
  return Boolean(row);
};
