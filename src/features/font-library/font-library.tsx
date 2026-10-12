"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createProject, projectToDocument } from "@/features/font-builder/project-storage";
import type { FontSummary } from "@/features/font-builder/types";
import { createCloudFont, removeCloudFont, updateCloudFont } from "./font-api";
import { FontCard } from "./font-card";

type FontLibraryProps = { initialFonts: FontSummary[] };

export const FontLibrary = ({ initialFonts }: FontLibraryProps) => {
  const router = useRouter();
  const [fonts, setFonts] = useState(initialFonts);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setCreating(true);
    setError("");
    try {
      const project = createProject();
      const font = await createCloudFont({
        id: project.id,
        name: project.name,
        document: projectToDocument(project),
      });
      router.push(`/fonts/${font.id}`);
      router.refresh();
    } catch {
      setError("Unable to create a font. Check your connection and try again.");
      setCreating(false);
    }
  };

  const rename = async (font: FontSummary, name: string) => {
    const saved = await updateCloudFont(font.id, {
      expectedRevision: font.revision,
      name,
    });
    setFonts((current) => current.map((item) => item.id === font.id ? {
      ...item,
      name: saved.name,
      revision: saved.revision,
      updatedAt: saved.updatedAt,
    } : item));
  };

  const remove = async (font: FontSummary) => {
    await removeCloudFont(font.id);
    setFonts((current) => current.filter((item) => item.id !== font.id));
  };

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your fonts</h1>
          <p className="mt-2 text-muted-foreground">Create a font or continue one you already started.</p>
        </div>
        <Button type="button" size="lg" disabled={creating} onClick={() => void create()}>
          {creating ? "Creating…" : "Create font"}
        </Button>
      </div>
      <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>
      {fonts.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fonts.map((font) => (
            <FontCard key={font.id} font={font} onDelete={remove} onRename={rename} />
          ))}
        </div>
      ) : (
        <section className="mt-10 rounded-3xl bg-muted/50 px-6 py-14 text-center ring-1 ring-border">
          <h2 className="text-lg font-semibold">No saved fonts yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Create a font to draw your first glyph and keep your work synced.
          </p>
          <Button type="button" className="mt-5" disabled={creating} onClick={() => void create()}>
            Create your first font
          </Button>
        </section>
      )}
    </main>
  );
};
